import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { betaTesting } from './controller';

export default () => {
	page( '/beta-testing/:site?', siteSelection, navigation, betaTesting, makeLayout, clientRender );
};
