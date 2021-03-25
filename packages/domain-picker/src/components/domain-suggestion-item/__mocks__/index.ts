/**
 * Internal dependencies
 */
import { MOCK_DOMAIN_SUGGESTION } from '../../../__mocks__/suggestions';

export const MOCK_SUGGESTION_ITEM_PARTIAL_PROPS = {
	railcarId: 'id',
	domain: MOCK_DOMAIN_SUGGESTION.domain_name,
	cost: MOCK_DOMAIN_SUGGESTION.cost,
	onSelect: jest.fn(),
	onRender: jest.fn(),
};
