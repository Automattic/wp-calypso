/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { vi } from 'vitest';
import PluginUpload from '../index';

let mockUploadMethod = null;
let mockInProgress = false;
let mockUploadedPluginId = null;

const mockPage = vi.fn();

vi.mock( '@automattic/calypso-router', () => {
	const page = ( ...args ) => mockPage( ...args );
	page.back = () => {};
	return { ...page, default: page };
} );

vi.mock( 'calypso/state/selectors/get-plugin-upload-method', () => ( {
	default: () => mockUploadMethod,
} ) );
vi.mock( 'calypso/state/selectors/is-plugin-upload-in-progress', () => ( {
	default: () => mockInProgress,
} ) );
vi.mock( 'calypso/state/selectors/is-plugin-upload-complete', () => ( {
	default: () => ! mockInProgress && !! mockUploadedPluginId,
} ) );
vi.mock( 'calypso/state/selectors/get-uploaded-plugin-id', () => ( {
	default: () => mockUploadedPluginId,
} ) );
vi.mock( 'calypso/state/selectors/get-plugin-upload-error', () => ( { default: () => null } ) );
vi.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => ( { default: () => true } ) );
vi.mock( 'calypso/state/selectors/site-has-feature', () => ( { default: () => true } ) );

vi.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteAdminUrl: () => 'https://example.wordpress.com/wp-admin/',
	isJetpackSite: () => false,
	isJetpackSiteMultiSite: () => false,
} ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 77203074,
	getSelectedSite: () => ( { ID: 77203074, slug: 'example.wordpress.com' } ),
	getSelectedSiteSlug: () => 'example.wordpress.com',
} ) );
vi.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getEligibility: () => ( { eligibilityHolds: [], eligibilityWarnings: [] } ),
	isEligibleForAutomatedTransfer: () => true,
} ) );
vi.mock( 'calypso/state/purchases/selectors', () => ( {
	isFetchingSitePurchases: () => false,
	hasLoadedSitePurchasesFromServer: () => true,
} ) );
vi.mock( 'calypso/sites-dashboard/utils', () => ( { isHostingTrialSite: () => false } ) );

vi.mock( 'calypso/state/plugins/upload/actions', () => ( {
	uploadPlugin: () => ( { type: 'PLUGIN_UPLOAD' } ),
	clearPluginUpload: ( siteId ) => ( { type: 'PLUGIN_UPLOAD_CLEAR', siteId } ),
} ) );
vi.mock( 'calypso/state/automated-transfer/actions', () => ( {
	fetchAutomatedTransferStatus: () => ( { type: 'FETCH_TRANSFER_STATUS' } ),
	initiateAutomatedTransferWithPluginZip: () => ( { type: 'INITIATE_TRANSFER' } ),
} ) );
vi.mock( 'calypso/state/marketplace/purchase-flow/actions', () => ( {
	productToBeInstalled: () => ( { type: 'PRODUCT_TO_BE_INSTALLED' } ),
} ) );
vi.mock( 'calypso/state/notices/actions', () => ( {
	successNotice: () => ( { type: 'SUCCESS_NOTICE' } ),
} ) );

vi.mock( 'calypso/blocks/upload-drop-zone', () => ( { default: () => <div>Drop zone</div> } ) );
vi.mock( 'calypso/blocks/eligibility-warnings', () => ( { default: () => null } ) );
vi.mock( 'calypso/blocks/upsell-nudge', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/query-atat-eligibility', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/query-site-purchases', () => ( { default: () => null } ) );
vi.mock( 'calypso/hosting/server-settings/hosting-activate-status', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/lib/analytics/page-view-tracker', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/navigation-header', () => ( { default: () => null } ) );

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
		vi.clearAllMocks();
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
