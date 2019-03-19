/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PendingGappsTosNoticeDialog from './pending-gapps-tos-notice-dialog';

function PendingGappsTosNoticeAction( props ) {
	const [ dialogVisible, setDialogVisible ] = useState( false );
	const onFixClickHandler = e => {
		e.preventDefault;
		setDialogVisible( true );
	};
	const onCloseClickHandler = () => {
		setDialogVisible( false );
	};

	const translate = useTranslate();

	return (
		<Fragment>
			<button onClick={ onFixClickHandler }>{ translate( 'Fix' ) }</button>
			<PendingGappsTosNoticeDialog
				domainName={ props.domainName }
				isMultipleDomains={ props.isMultipleDomains }
				onClose={ onCloseClickHandler }
				section={ props.section }
				severity={ props.severity }
				siteSlug={ props.siteSlug }
				user={ props.user }
				visible={ dialogVisible }
			/>
		</Fragment>
	);
}

PendingGappsTosNoticeAction.propTypes = {
	domainName: PropTypes.string.isRequired,
	isMultipleDomains: PropTypes.bool.isRequired,
	section: PropTypes.string.isRequired,
	severity: PropTypes.string.isRequired,
	siteSlug: PropTypes.string.isRequired,
	user: PropTypes.string.isRequired,
};

export default PendingGappsTosNoticeAction;
