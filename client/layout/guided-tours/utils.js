/**
 * External dependencies
 */
import { negate as not } from 'lodash';

const noop = () => {};

const and = ( ...conditions ) => () => conditions.every( ( cond ) => cond() );

export { and, not, noop };
