import config from 'config';
import GuideComponent from '../../lib/components/guide-component';
import SideBarComponent from '../../lib/components/sidebar-component';
import * as dataHelper from '../../lib/data-helper';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import MediaPage from '../../lib/pages/media-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Media: Edit Media (${ screenSize }) @parallel @jetpack`, function () {
	this.timeout( mochaTimeOut );

	before( 'Can login and select my site', async function () {
		const loginFlow = new LoginFlow( this.driver );
		await loginFlow.loginAndSelectMySite();
	} );

	it( "Select 'Media' option and see media content", async function () {
		const sideBarComponent = await SideBarComponent.Expect( this.driver );
		await sideBarComponent.selectMedia();
		return await MediaPage.Expect( this.driver );
	} );

	it( 'Select a random media item and click edit', async function () {
		if ( process.env.FLAGS === 'nav-unification/switcher' ) {
			// Makes sure that the Quick Switch modal will be dismissed.
			const guideComponent = new GuideComponent( this.driver );
			await guideComponent.dismiss( 1000, '.nav-unification-quick-switch-modal' );
		}
		const mediaPage = await MediaPage.Expect( this.driver );
		await mediaPage.selectFirstImage();
		await mediaPage.selectEditMedia();
		return await mediaPage.mediaEditorShowing();
	} );

	it( 'Click Edit Image', async function () {
		const mediaPage = await MediaPage.Expect( this.driver );
		await mediaPage.clickEditImage();
		return await mediaPage.imageShowingInEditor();
	} );
} );
