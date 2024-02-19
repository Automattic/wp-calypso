import page, { type Callback } from '@automattic/calypso-router';

export const redirectToOverviewContext: Callback = () => {
	page( '/overview' );
};
