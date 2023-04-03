/* global wpcomGlobalStyles */
import { ExternalLink, Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, render, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './notice.scss';
import { recordUpgradePreSaveNoticeClick, recordUpgradeNoticePreSaveShow } from './tracks-events';
import { useGlobalStylesConfig } from './use-global-styles-config';

function GlobalStylesNoticeComponent() {
	const { siteChanges, globalStylesInUse } = useGlobalStylesConfig();

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
		if ( globalStylesInUse ) {
			recordUpgradeNoticePreSaveShow();
		}
	}, [ globalStylesInUse ] );

	if ( ! globalStylesInUse ) {
		return null;
	}

	return (
		<Notice
			status="warning"
			isDismissible={ false }
			className="wpcom-global-styles-notice notice-margin"
		>
			{ createInterpolateElement(
				__(
					'Your changes include customized styles that will only be visible once you <a>upgrade to a Premium plan</a>.',
					'full-site-editing'
				),
				{
					a: (
						<ExternalLink
							href={ wpcomGlobalStyles.upgradeUrl }
							target="_blank"
							onClick={ recordUpgradePreSaveNoticeClick }
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
