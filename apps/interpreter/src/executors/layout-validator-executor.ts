import {
  AbstractDataType,
  ColumnSection,
  LayoutValidator,
  LayoutValidatorMetaInformation,
  RowSection,
  Section,
  Sheet,
  Table,
  getDataType,
  isColumnSection,
  isRowSection,
} from '@jayvee/language-server';

import { getColumn, getColumnIndexFromSelector } from '../data-util';

import { BlockExecutor } from './block-executor';
import * as R from './execution-result';

export class LayoutValidatorExecutor extends BlockExecutor<
  LayoutValidator,
  Sheet,
  Table,
  LayoutValidatorMetaInformation
> {
  override execute(input: Sheet): Promise<R.Result<Table>> {
    const sections = this.block.layout.ref?.sections || [];
    const validityResult = this.ensureValidSections(sections, input.data);
    if (R.isErr(validityResult)) {
      return Promise.resolve(validityResult);
    }
    return Promise.resolve(
      R.ok({
        columnNames: this.getHeader(input),
        columnTypes: this.getColumnTypes(sections, input.width),
        data: input.data.filter((_, index) => index !== this.getHeaderIndex()),
      }),
    );
  }

  getHeader(input: Sheet): string[] {
    const headerRowSection = this.block.layout.ref?.sections.find(
      (x) => isRowSection(x) && x.header,
    ) as RowSection | undefined;

    const columnNamesIndex = this.getHeaderIndex();

    if (columnNamesIndex === undefined) {
      return [];
    }

    let columnNames: string[] = [];
    if (
      headerRowSection !== undefined &&
      input.data[columnNamesIndex] !== undefined
    ) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      columnNames = input.data[columnNamesIndex]!;
    }

    return columnNames;
  }

  getHeaderIndex(): number | undefined {
    const headerRowSection = this.block.layout.ref?.sections.find(
      (x) => isRowSection(x) && x.header,
    ) as RowSection | undefined;

    return headerRowSection ? headerRowSection.rowId - 1 : undefined;
  }

  ensureValidSections(sections: Section[], data: string[][]): R.Result<void> {
    const errors: string[] = [];
    sections.forEach((section) => {
      const type = getDataType(section.type);
      if (isRowSection(section)) {
        const rowId = section.rowId;
        const dataToValidate = data[rowId] || [];
        dataToValidate.forEach((value, position) => {
          if (!type.isValid(value)) {
            errors.push(
              `[row ${rowId}, column ${this.getColumnCharacter(
                position,
              )}] Value "${value}" does not match type ${type.languageType}`,
            );
          }
        });
      } else {
        const columnId = section.columnId;
        const dataToValidate = getColumn(
          data,
          getColumnIndexFromSelector(columnId),
          undefined,
        ).filter((_, index) => index !== this.getHeaderIndex());
        dataToValidate.forEach((value, position) => {
          if (!type.isValid(value)) {
            errors.push(
              `[row ${position}, column ${columnId}] Value "${
                value ?? 'undefined'
              }" does not match type ${type.languageType}`,
            );
          }
        });
      }
    });
    if (errors.length > 0) {
      return R.err({
        message: `Layout validation failed. Found the following issues:\n\n${errors.join(
          '\n',
        )}`,
        hint: 'Please check your defined layout.',
        cstNode: this.block.$cstNode?.parent,
      });
    }
    return R.ok(undefined);
  }

  getColumnTypes(
    sections: Section[],
    width: number,
  ): Array<AbstractDataType | undefined> {
    const columnTypes: { [index: number]: AbstractDataType | undefined } = {};

    (
      sections.filter((section) => isColumnSection(section)) as ColumnSection[]
    ).forEach((section: ColumnSection) => {
      columnTypes[getColumnIndexFromSelector(section.columnId)] = getDataType(
        section.type,
      );
    });

    const columnTypesArray: Array<AbstractDataType | undefined> = [];

    for (let i = 0; i < width; i++) {
      columnTypesArray.push(columnTypes[i]);
    }

    return columnTypesArray;
  }

  getColumnCharacter(columnId: number): string {
    const startCharacter = 'A'.charCodeAt(0);
    return String.fromCharCode(startCharacter + columnId);
  }
}
