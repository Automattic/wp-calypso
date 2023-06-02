import { ReactElement } from 'react';
import * as React from 'react';
import CurrentUserHasCapabilitiesSwitch from 'calypso/components/jetpack/current-user-has-capabilities-switch';

const ADMIN_CAPABILITIES = [ 'manage_options' ];

const IsCurrentUserAdminSwitch: React.FC< Props > = ( { trueComponent, falseComponent } ) => (
	<CurrentUserHasCapabilitiesSwitch
		capabilities={ ADMIN_CAPABILITIES }
		trueComponent={ trueComponent }
		falseComponent={ falseComponent }
	/>
);

type Props = {
	trueComponent: ReactElement;
	falseComponent: ReactElement;
};

export default IsCurrentUserAdminSwitch;
