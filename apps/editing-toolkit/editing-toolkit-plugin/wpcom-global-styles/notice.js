/* global wpcomGlobalStyles */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Notice } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import './notice.scss';

const GlobalStylesNotice = () => {
	const { globalStylesConfig, globalStylesId, siteChanges } = useSelect( ( select ) => {
		const {
			getEditedEntityRecord,
			__experimentalGetCurrentGlobalStylesId,
			__experimentalGetDirtyEntityRecords,
		} = select( 'core' );

		const _globalStylesId = __experimentalGetCurrentGlobalStylesId
			? __experimentalGetCurrentGlobalStylesId()
			: null;
		const globalStylesRecord = getEditedEntityRecord( 'root', 'globalStyles', _globalStylesId );

		return {
			globalStylesConfig: {
				styles: globalStylesRecord?.styles ?? {},
				settings: globalStylesRecord?.settings ?? {},
			},
			globalStylesId: _globalStylesId,
			siteChanges: __experimentalGetDirtyEntityRecords ? __experimentalGetDirtyEntityRecords() : [],
		};
	}, [] );

	const { editEntityRecord } = useDispatch( 'core' );
	const canRevertGlobalStyles = !! globalStylesId;
	const resetGlobalStyles = () => {
		if ( ! canRevertGlobalStyles ) {
			return;
		}

		editEntityRecord( 'root', 'globalStyles', globalStylesId, {
			styles: {},
			settings: {},
		} );

		recordTracksEvent( 'calypso_global_styles_paid_feature_notice_reset_click' );
	};
	// Do not show the notice if the use is trying to save the default styles.
	const isVisible =
		Object.keys( globalStylesConfig.styles ).length ||
		Object.keys( globalStylesConfig.settings ).length;

	// Closes the sidebar if there are no more changes to be saved.
	useEffect( () => {
		if ( ! siteChanges.length ) {
			/*
			 * This uses a fragile CSS selector to target the cancel button which might be broken on
			 * future releases of Gutenberg. Unfortunately, Gutenberg doesn't provide any mechanism
			 * for closing the sidebar – everything is handled using an internal state that it is not
			 * exposed publicly.
			 *
			 * See https://github.com/WordPress/gutenberg/blob/0b30a4cb34d39c9627b6a3795a18aee21019ce25/packages/edit-site/src/components/editor/index.js#L137-L138.
			 */
			document.querySelector( '.entities-saved-states__panel-header button:last-child' )?.click();
		}
	}, [ siteChanges ] );

	useEffect( () => {
		if ( isVisible ) {
			recordTracksEvent( 'calypso_global_styles_paid_feature_notice_show' );
		}
	}, [ isVisible ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
			{ createInterpolateElement(
				__(
					"Your style changes won't be public until you <a>upgrade your plan</a>.",
					'full-site-editing'
				),
				{
					a: (
						<Button
							variant="link"
							href={ wpcomGlobalStyles.upgradeUrl }
							target="_top"
							onClick={ () =>
								recordTracksEvent( 'calypso_global_styles_paid_feature_notice_upgrade_click' )
							}
						/>
					),
				}
			) }
			&nbsp;
			{ canRevertGlobalStyles &&
				createInterpolateElement( __( 'You can <a>reset your styles</a>.', 'full-site-editing' ), {
					a: <Button variant="link" onClick={ resetGlobalStyles } />,
				} ) }
		</Notice>
	);
};

export default GlobalStylesNotice;
