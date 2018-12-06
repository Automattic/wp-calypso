/** @format */
/**
 * External dependencies
 */
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import { DomainSelect } from '../domain-select';

describe( 'DomainSelect', () => {
	test( 'it renders correctly', () => {
		const tree = renderer
			.create(
				<DomainSelect animationKey={ 0 } animate={ 'left' }>
					{ () => <div /> }
				</DomainSelect>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
