/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import SettingsNavigation from '../navigation';
import { getLink } from 'woocommerce/lib/nav-utils';

const Development = ( { isSaving, site, translate, className } ) => {
	const breadcrumbs = [
		( <a href={ getLink( '/store/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
		( <span>{ translate( 'Development' ) }</span> ),
	];

	const	onSave = () => { };

	return (
		<Main className={ classNames( 'development', className ) }>
			<ActionHeader breadcrumbs={ breadcrumbs }>
				<Button
					primary
					onClick={ onSave }
					busy={ isSaving }
					disabled={ isSaving }>
					{ translate( 'Save' ) }
				</Button>
			</ActionHeader>
			<SettingsNavigation activeSection="development" />
		</Main>
	);
};

Development.propTypes = {
	className: PropTypes.string
};

export default localize( Development );
