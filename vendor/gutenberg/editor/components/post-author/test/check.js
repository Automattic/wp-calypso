/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostAuthorCheck } from '../check';

describe( 'PostAuthorCheck', () => {
	const users = {
		data: [
			{
				id: 1,
				name: 'admin',
				capabilities: {
					level_1: true,
				},
			},
			{
				id: 2,
				name: 'subscriber',
				capabilities: {
					level_0: true,
				},
			},
			{
				id: 3,
				name: 'andrew',
				capabilities: {
					level_1: true,
				},
			},
		],
	};

	it( 'should not render anything if users unknown', () => {
		const wrapper = shallow( <PostAuthorCheck authors={ [] } hasAssignAuthorAction={ true }>authors</PostAuthorCheck> );
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if single user', () => {
		const wrapper = shallow(
			<PostAuthorCheck authors={ users.data.slice( 0, 1 ) } hasAssignAuthorAction={ true }>
				authors
			</PostAuthorCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if doesn\'t have author action', () => {
		const wrapper = shallow(
			<PostAuthorCheck authors={ users } hasAssignAuthorAction={ false }>
				authors
			</PostAuthorCheck>
		);
		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should render  control', () => {
		const wrapper = shallow(
			<PostAuthorCheck authors={ users } hasAssignAuthorAction={ true }>
				authors
			</PostAuthorCheck>
		);

		expect( wrapper.type() ).not.toBe( null );
	} );
} );
