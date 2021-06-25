/**
 * External dependencies
 */
import styled, { CreateStyled } from '@emotion/styled';
import type { Theme } from '@automattic/composite-checkout';

// Use this instead of directly using `styled` from emotion to support
// TypeScript and the composite-checkout theme
export default styled as CreateStyled< Theme >;
