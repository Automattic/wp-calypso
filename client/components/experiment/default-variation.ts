/**
 * Internal Dependencies
 */
import Variation from './variation';

/**
 * Overrides a regular variation, and adds `null` and `undefined` as possible variations to display
 */
export default class DefaultVariation extends Variation {
	acceptedVariation = [ null, undefined, this.props.name ];
}
