// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import * as fs from 'fs/promises';
import * as path from 'path';

import * as R from '@jvalue/jayvee-execution';
import {
  AbstractBlockExecutor,
  BinaryFile,
  BlockExecutorClass,
  ExecutionContext,
  FileExtension,
  MimeType,
  None,
  implementsStatic,
} from '@jvalue/jayvee-execution';
import { IOType, PrimitiveValuetypes } from '@jvalue/jayvee-language-server';

import { inferFileExtensionFromFileExtensionString } from './file-util';

@implementsStatic<BlockExecutorClass>()
export class LocalFileExtractorExecutor extends AbstractBlockExecutor<
  IOType.NONE,
  IOType.FILE
> {
  public static readonly type = 'LocalFileExtractor';

  constructor() {
    super(IOType.NONE, IOType.FILE);
  }

  async doExecute(
    input: None,
    context: ExecutionContext,
  ): Promise<R.Result<BinaryFile>> {
    const filePath = context.getPropertyValue(
      'filePath',
      PrimitiveValuetypes.Text,
    );

    try {
      const rawData = await fs.readFile(filePath);

      // Infer FileName and FileExtension from filePath
      const fileName = path.basename(filePath);
      const extName = path.extname(fileName);
      const fileExtension =
        inferFileExtensionFromFileExtensionString(extName) ||
        FileExtension.NONE;

      // Infer Mimetype from FileExtension, if not inferrable, then default to application/octet-stream
      const mimeType: MimeType | undefined = MimeType.APPLICATION_OCTET_STREAM;

      // Create file and return file
      const file = new BinaryFile(
        fileName,
        fileExtension,
        mimeType,
        rawData.buffer as ArrayBuffer,
      );

      return R.ok(file);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Check if the file path starts with "../"
      if (filePath.startsWith('../')) {
        const errorMessage = `Error: File path "${filePath}" is not allowed. Path traversal is restricted.`;
        return R.err({
          message: errorMessage,
          diagnostic: { node: context.getCurrentNode(), property: 'filePath' },
        });
      }
      return R.err({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error.message,
        diagnostic: { node: context.getCurrentNode(), property: 'filePath' },
      });
    }
  }
}
