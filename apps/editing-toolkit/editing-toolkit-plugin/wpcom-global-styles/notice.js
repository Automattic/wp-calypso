/* global wpcomGlobalStyles */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ExternalLink, Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, render, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import './notice.scss';

function GlobalStylesNoticeComponent() {
	const { globalStylesConfig, siteChanges } = useSelect( ( select ) => {
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
			siteChanges: __experimentalGetDirtyEntityRecords ? __experimentalGetDirtyEntityRecords() : [],
		};
	}, [] );

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
			recordTracksEvent( 'calypso_global_styles_gating_notice_show', {
				context: 'site-editor',
			} );
		}
	}, [ isVisible ] );

	if ( ! isVisible ) {
		return null;
	}

	return (
		<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
			{ createInterpolateElement(
				__(
					'Your changes include customised styles that will only be visible once you <a>upgrade to a Premium plan</a>.',
					'full-site-editing'
				),
				{
					a: (
						<ExternalLink
							href={ wpcomGlobalStyles.upgradeUrl }
							target="_blank"
							onClick={ () =>
								recordTracksEvent( 'calypso_global_styles_gating_notice_upgrade_click', {
									context: 'site-editor',
								} )
							}
						/>
					),
				}
			) }
		</Notice>
	);
}

export default function GlobalStylesNotice() {
	const { globalStylesConfig, isSaveViewOpened } = useSelect( ( select ) => ( {
		globalStylesConfig: select( 'core' ).getEntityConfig( 'root', 'globalStyles' ),
		isSaveViewOpened: select( 'core/edit-site' ).isSaveViewOpened(),
	} ) );

	const [ isNoticeRendered, setIsNoticeRendered ] = useState( false );

	useEffect( () => {
		if ( ! globalStylesConfig || ! isSaveViewOpened ) {
			setIsNoticeRendered( false );
			return;
		}
		if ( isNoticeRendered ) {
			return;
		}

		const preSavePanelTitles = document.querySelectorAll(
			'.entities-saved-states__panel .components-panel__body.is-opened .components-panel__body-title'
		);

		for ( const entityTitle of preSavePanelTitles ) {
			if ( entityTitle.textContent !== globalStylesConfig.label ) {
				continue;
			}

			const noticeContainer = document.createElement( 'div' );
			entityTitle.parentElement.append( noticeContainer );
			render( <GlobalStylesNoticeComponent />, noticeContainer );
			setIsNoticeRendered( true );
			break;
		}
	}, [ globalStylesConfig, isNoticeRendered, isSaveViewOpened ] );

	return null;
}
