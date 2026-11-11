/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import PluginUpload from '../index';

let mockUploadMethod = null;
let mockInProgress = false;
let mockUploadedPluginId = null;

const mockPage = jest.fn();

jest.mock( '@automattic/calypso-router', () => {
	const page = ( ...args ) => mockPage( ...args );
	page.back = () => {};
	return page;
} );

jest.mock( 'calypso/state/selectors/get-plugin-upload-method', () => () => mockUploadMethod );
jest.mock( 'calypso/state/selectors/is-plugin-upload-in-progress', () => () => mockInProgress );
jest.mock(
	'calypso/state/selectors/is-plugin-upload-complete',
	() => () => ! mockInProgress && !! mockUploadedPluginId
);
jest.mock( 'calypso/state/selectors/get-uploaded-plugin-id', () => () => mockUploadedPluginId );
jest.mock( 'calypso/state/selectors/get-plugin-upload-error', () => () => null );
jest.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => () => true );
jest.mock( 'calypso/state/selectors/site-has-feature', () => () => true );

jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteAdminUrl: () => 'https://example.wordpress.com/wp-admin/',
	isJetpackSite: () => false,
	isJetpackSiteMultiSite: () => false,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 77203074,
	getSelectedSite: () => ( { ID: 77203074, slug: 'example.wordpress.com' } ),
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getEligibility: () => ( { eligibilityHolds: [], eligibilityWarnings: [] } ),
	isEligibleForAutomatedTransfer: () => true,
} ) );
jest.mock( 'calypso/state/purchases/selectors', () => ( {
	isFetchingSitePurchases: () => false,
	hasLoadedSitePurchasesFromServer: () => true,
} ) );
jest.mock( 'calypso/sites-dashboard/utils', () => ( { isHostingTrialSite: () => false } ) );

jest.mock( 'calypso/state/plugins/upload/actions', () => ( {
	uploadPlugin: () => ( { type: 'PLUGIN_UPLOAD' } ),
	clearPluginUpload: ( siteId ) => ( { type: 'PLUGIN_UPLOAD_CLEAR', siteId } ),
} ) );
jest.mock( 'calypso/state/automated-transfer/actions', () => ( {
	fetchAutomatedTransferStatus: () => ( { type: 'FETCH_TRANSFER_STATUS' } ),
	initiateAutomatedTransferWithPluginZip: () => ( { type: 'INITIATE_TRANSFER' } ),
} ) );
jest.mock( 'calypso/state/marketplace/purchase-flow/actions', () => ( {
	productToBeInstalled: () => ( { type: 'PRODUCT_TO_BE_INSTALLED' } ),
} ) );
jest.mock( 'calypso/state/notices/actions', () => ( {
	successNotice: () => ( { type: 'SUCCESS_NOTICE' } ),
} ) );

jest.mock( 'calypso/blocks/upload-drop-zone', () => () => <div>Drop zone</div> );
jest.mock( 'calypso/blocks/eligibility-warnings', () => () => null );
jest.mock( 'calypso/blocks/upsell-nudge', () => () => null );
jest.mock( 'calypso/components/data/query-atat-eligibility', () => () => null );
jest.mock( 'calypso/components/data/query-site-purchases', () => () => null );
jest.mock( 'calypso/hosting/server-settings/hosting-activate-status', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );
jest.mock( 'calypso/components/navigation-header', () => () => null );

// The store's contents do not matter — every selector is mocked — but a real one lets a dispatch
// push the new upload state through connect, which is what the page reacts to.
const tick = ( state = 0, action ) => ( action.type === 'TICK' ? state + 1 : state );

const renderUploadPage = () => {
	const store = createStore( tick );
	render(
		<Provider store={ store }>
			<PluginUpload />
		</Provider>
	);
	return () => act( () => store.dispatch( { type: 'TICK' } ) );
};

describe( 'PluginUpload', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUploadMethod = null;
		mockInProgress = false;
		mockUploadedPluginId = null;
	} );

	it( 'offers the drop zone when no upload has been started', () => {
		renderUploadPage();

		expect( screen.getByText( 'Drop zone' ) ).toBeVisible();
	} );

	it( 'hides the drop zone while this page has an upload running', () => {
		mockUploadMethod = 'direct';
		mockInProgress = true;
		renderUploadPage();

		expect( screen.queryByText( 'Drop zone' ) ).not.toBeInTheDocument();
	} );

	it( 'hides the drop zone once this page has an upload of its own that finished', () => {
		mockUploadMethod = 'direct';
		mockUploadedPluginId = 'give';
		renderUploadPage();

		expect( screen.queryByText( 'Drop zone' ) ).not.toBeInTheDocument();
	} );

	// The bug: the retry on the install error screen clears the attempt but cannot abort its
	// request, so the abandoned upload finished a moment later and took the drop zone away again.
	it( 'keeps the drop zone when an abandoned upload finishes afterwards', () => {
		const settle = renderUploadPage();
		expect( screen.getByText( 'Drop zone' ) ).toBeVisible();

		mockUploadedPluginId = 'give';
		settle();

		expect( screen.getByText( 'Drop zone' ) ).toBeVisible();
	} );

	// The same abandoned attempt reaching the transfer status reducer, which reports it as running.
	it( 'does not send the user to the install page for an abandoned upload', () => {
		const settle = renderUploadPage();

		mockInProgress = true;
		settle();

		expect( mockPage ).not.toHaveBeenCalled();
	} );

	it( 'sends the user to the install page when this page starts an upload', () => {
		const settle = renderUploadPage();

		mockUploadMethod = 'direct';
		mockInProgress = true;
		settle();

		expect( mockPage ).toHaveBeenCalledWith( '/marketplace/plugin/install/example.wordpress.com' );
	} );
} );
