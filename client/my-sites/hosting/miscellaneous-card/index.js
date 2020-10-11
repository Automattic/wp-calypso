/**
 * External dependencies
 */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card, Dialog } from '@automattic/components';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
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
	const [ showDialog, setShowDialog ] = useState( false );
	const [ reason, setReason ] = useState( '' );

	const clearCache = () => {
		clearAtomicWordPressCache( siteId, reason );
		setShowDialog( false );
		setReason( '' );
	};

	const showConfirmationDialog = () => {
		setShowDialog( true );
	};

	const closeConfirmationDialog = () => {
		setShowDialog( false );
	};

	const onReasonChange = ( event ) => {
		setReason( event.target.value );
	};

	const getClearCacheContent = () => {
		const clearCacheText = translate( 'Clear Cache' );
		const clearCacheDisabled = ! reason || reason.length < 3;
		const deleteButtons = [
			<Button onClick={ closeConfirmationDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ clearCacheDisabled } onClick={ clearCache }>
				{ clearCacheText }
			</Button>,
		];

		return (
			<div>
				<p>
					{ translate( '{{strong}}Warning!{{/strong}}', {
						components: {
							strong: <strong />,
						},
					} ) }
				</p>
				<p>
					{ translate(
						'Clearing the cache on your site may make it unresponsive while the cache is rebuilding. ' +
							'Please use this feature responsibly.'
					) }
				</p>
				<Button
					onClick={ showConfirmationDialog }
					busy={ isClearingCache }
					disabled={ disabled || isClearingCache }
				>
					<span>{ clearCacheText }</span>
				</Button>

				<Dialog
					isVisible={ showDialog }
					buttons={ deleteButtons }
					className="miscellaneous-card__confirm-dialog"
				>
					<h1 className="miscellaneous-card__confirm-header">{ clearCacheText }</h1>
					<FormLabel
						htmlFor="confirmDomainChangeInput"
						className="miscellaneous-card__confirm-label"
					>
						<p>{ translate( "Please let us know why you are clearing your site's cache." ) }</p>
						<p>
							{ translate(
								'We use this information to audit plugins and give valuable feedback to plugin developers. ' +
									'It is our way of giving back to the community and helping people learn more about WordPress.'
							) }
						</p>
					</FormLabel>

					<FormTextInput
						autoCapitalize="off"
						onChange={ onReasonChange }
						value={ reason }
						aria-required="true"
						id="confirmDomainChangeInput"
					/>
				</Dialog>
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
			{ getClearCacheContent() }
		</Card>
	);
};

export default connect(
	( state ) => {
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
