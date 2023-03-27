// SPDX-FileCopyrightText: 2023 Friedrich-Alexander-Universitat Erlangen-Nurnberg
//
// SPDX-License-Identifier: AGPL-3.0-only

import { registerMetaInformation } from '../meta-information/meta-inf-registry';

import { AllowlistConstraintMetaInformation } from './allowlist-constraint-meta-inf';
import { DenylistConstraintMetaInformation } from './denylist-constraint-meta-inf';
import { LengthConstraintMetaInformation } from './length-constraint-meta-inf';
import { RangeConstraintMetaInformation } from './range-constraint-meta-inf';
import { RegexConstraintMetaInformation } from './regex-constraint-meta-inf';

export function registerConstraints() {
  registerMetaInformation(AllowlistConstraintMetaInformation);
  registerMetaInformation(DenylistConstraintMetaInformation);
  registerMetaInformation(RegexConstraintMetaInformation);
  registerMetaInformation(LengthConstraintMetaInformation);
  registerMetaInformation(RangeConstraintMetaInformation);
}
