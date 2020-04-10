/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import CardHeading from 'components/card-heading';
import MaterialIcon from 'components/material-icon';
import { getSelectedSiteId } from 'state/ui/selectors';
import { clearWordPressCache } from 'state/hosting/actions';
import getRequest from 'state/selectors/get-request';
import { isAtomicClearCacheEnabled } from 'state/selectors/is-atomic-clear-cache-enabled';

/**
 * Style dependencies
 */
import './style.scss';

const MiscellaneousCard = ( {
	disabled,
	clearAtomicWordPressCache,
	isClearCacheEnabled,
	isClearingCache,
	siteId,
	translate,
} ) => {
	const clearCache = () => {
		clearAtomicWordPressCache( siteId );
	};

	const getContent = () => {
		return (
			<div>
				<Button
					className="miscellaneous-card__clear-cache"
					onClick={ clearCache }
					busy={ isClearingCache }
					disabled={ disabled || isClearingCache }
				>
					<span>{ translate( 'Clear WordPress Cache' ) }</span>
				</Button>
			</div>
		);
	};

	if ( ! isClearCacheEnabled ) {
		return null;
	}

	return (
		<Card className="miscellaneous-card">
			<MaterialIcon icon="settings" size={ 32 } />
			<CardHeading>{ translate( 'Miscellaneous' ) }</CardHeading>
			{ getContent() }
		</Card>
	);
};

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			isClearCacheEnabled: isAtomicClearCacheEnabled( state, siteId ),
			isClearingCache: getRequest( state, clearWordPressCache( siteId ) )?.isLoading ?? false,
			siteId,
		};
	},
	{
		clearAtomicWordPressCache: clearWordPressCache,
	}
)( localize( MiscellaneousCard ) );
