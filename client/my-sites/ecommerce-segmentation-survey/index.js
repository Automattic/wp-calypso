import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { renderSurvey } from './controller';

export default () => {
	page( '/ecommerce-segmentation-survey', renderSurvey, makeLayout, clientRender );
};
