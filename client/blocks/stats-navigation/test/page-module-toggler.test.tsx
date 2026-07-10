/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageModuleToggler from '../page-module-toggler';
import type { ChangeEvent, ReactNode } from 'react';

const mockDispatch = jest.fn();
let mockHasVideoPress = true;

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'react-redux', () => ( {
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/selectors/site-has-feature', () => jest.fn( () => mockHasVideoPress ) );

jest.mock( 'calypso/state/stats/module-toggles/actions', () => ( {
	updateModuleToggles: jest.fn( ( siteId, payload ) => ( {
		type: 'STATS_MODULE_TOGGLES_UPDATE',
		siteId,
		payload,
	} ) ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	translate: ( text: string ) => text,
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( '@automattic/components', () => ( {
	Popover: ( { isVisible, children }: { isVisible: boolean; children: ReactNode } ) =>
		isVisible ? <div>{ children }</div> : null,
} ) );

jest.mock( '@wordpress/components', () => ( {
	FormToggle: ( {
		checked,
		onChange,
		className,
	}: {
		checked: boolean;
		onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
		className?: string;
	} ) => (
		<input type="checkbox" className={ className } checked={ checked } onChange={ onChange } />
	),
} ) );

jest.mock( '@wordpress/icons', () => ( {
	Icon: () => <span />,
	cog: 'cog',
	commentAuthorAvatar: 'commentAuthorAvatar',
	search: 'search',
	video: 'video',
} ) );

const defaultProps = {
	selectedItem: 'traffic',
	siteId: 123,
	isTooltipShown: false,
	onTooltipDismiss: jest.fn(),
	customToggleIcon: <span>Settings</span>,
};

function renderToggler( moduleToggles: { [ name: string ]: boolean } ) {
	return render( <PageModuleToggler { ...defaultProps } moduleToggles={ moduleToggles } /> );
}

function getToggle( label: string ) {
	const toggle = screen.getByText( label ).closest( '.page-modules-settings-toggle' );
	expect( toggle ).not.toBeNull();

	return within( toggle as HTMLElement ).getByRole( 'checkbox' );
}

describe( 'PageModuleToggler', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasVideoPress = true;
	} );

	it( 'reflects module toggle props when they load after the initial render', async () => {
		const user = userEvent.setup();
		const { rerender } = renderToggler( {} );

		await user.click( screen.getByRole( 'button', { name: 'Settings' } ) );

		expect( getToggle( 'Authors' ) ).toBeChecked();
		expect( getToggle( 'Videos' ) ).toBeChecked();

		rerender(
			<PageModuleToggler
				{ ...defaultProps }
				moduleToggles={ { authors: false, 'search-terms': false, videos: false } }
			/>
		);

		expect( getToggle( 'Authors' ) ).not.toBeChecked();
		expect( getToggle( 'Search terms' ) ).not.toBeChecked();
		expect( getToggle( 'Videos' ) ).not.toBeChecked();
	} );

	it( 'updates module toggles using the latest prop values', async () => {
		const user = userEvent.setup();

		renderToggler( { authors: false, 'search-terms': false, videos: true } );

		await user.click( screen.getByRole( 'button', { name: 'Settings' } ) );
		await user.click( getToggle( 'Authors' ) );

		expect( mockDispatch ).toHaveBeenCalledWith( {
			type: 'STATS_MODULE_TOGGLES_UPDATE',
			siteId: 123,
			payload: {
				traffic: { authors: true, 'search-terms': false, videos: true },
			},
		} );
	} );
} );
