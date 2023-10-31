// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import {
  createJayveeServices,
  useExtension,
} from '@jvalue/jayvee-language-server';
import {
  TestLangExtension,
  ValidationResult,
  readJvTestAssetHelper,
  validationHelper,
} from '@jvalue/jayvee-language-server/test';
import { AstNode } from 'langium';
import { NodeFileSystem } from 'langium/node';

import { TabularLangExtension } from '../extension';

describe('Validation of RowDeleterMetaInformation', () => {
  let validate: (input: string) => Promise<ValidationResult<AstNode>>;

  const readJvTestAsset = readJvTestAssetHelper(
    __dirname,
    '../../test/assets/',
  );

  beforeAll(() => {
    // Register std extension
    useExtension(new TabularLangExtension());
    // Register test extension
    useExtension(new TestLangExtension());
    // Create language services
    const services = createJayveeServices(NodeFileSystem).Jayvee;
    // Create validation helper for language services
    validate = validationHelper(services);
  });

  it('should diagnose error on deleting partial row', async () => {
    const text = readJvTestAsset(
      'row-deleter-meta-inf/invalid-partial-row-delete.jv',
    );

    const validationResult = await validate(text);
    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: 'An entire row needs to be selected',
        }),
      ]),
    );
  });

  it('should diagnose no error', async () => {
    const text = readJvTestAsset('row-deleter-meta-inf/valid-row-delete.jv');

    const validationResult = await validate(text);
    const diagnostics = validationResult.diagnostics;

    expect(diagnostics).toHaveLength(0);
  });
});
