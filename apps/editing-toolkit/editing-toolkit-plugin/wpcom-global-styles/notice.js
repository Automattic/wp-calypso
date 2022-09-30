/* global wpcomGlobalStyles */

import { Button, Notice } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import './notice.scss';

const GlobalStylesNotice = () => {
	const { globalStylesId, otherDirtyEntityRecords } = useSelect( ( select ) => {
		const { __experimentalGetCurrentGlobalStylesId, __experimentalGetDirtyEntityRecords } =
			select( 'core' );
		return {
			globalStylesId: __experimentalGetCurrentGlobalStylesId
				? __experimentalGetCurrentGlobalStylesId()
				: null,
			otherDirtyEntityRecords: __experimentalGetDirtyEntityRecords
				? __experimentalGetDirtyEntityRecords().filter( ( { name } ) => name !== 'globalStyles' )
				: [],
		};
	}, [] );

	const { editEntityRecord } = useDispatch( 'core' );
	const canRevertGlobalStyles = !! globalStylesId;
	const revertGlobalStyles = () => {
		if ( ! canRevertGlobalStyles ) {
			return;
		}

		editEntityRecord( 'root', 'globalStyles', globalStylesId, {
			styles: {},
			settings: {},
		} );

		if ( ! otherDirtyEntityRecords.length ) {
			/*
			 * Closes the sidebar if there are no more changes to be saved.
			 *
			 * This uses a fragile CSS selector to target the cancel button which might be broken on
			 * future releases of Gutenberg. Unfortunately, Gutenberg doesn't provide any mechanism
			 * for closing the sidebar – everything is handled using an internal state that it is not
			 * exposed publicly.
			 *
			 * See https://github.com/WordPress/gutenberg/blob/0b30a4cb34d39c9627b6a3795a18aee21019ce25/packages/edit-site/src/components/editor/index.js#L137-L138.
			 */
			const closeSidebarButton = document.querySelector(
				'.entities-saved-states__panel-header button:last-child'
			);
			closeSidebarButton?.click();
		}
	};

	return (
		<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
			{ createInterpolateElement(
				__(
					"Your style changes won't be public until you <a>upgrade your plan</a>.",
					'full-site-editing'
				),
				{
					a: <Button variant="link" href={ wpcomGlobalStyles.upgradeUrl } target="_top" />,
				}
			) }
			&nbsp;
			{ canRevertGlobalStyles &&
				createInterpolateElement( __( 'You can <a>revert your styles</a>.', 'full-site-editing' ), {
					a: <Button variant="link" onClick={ revertGlobalStyles } />,
				} ) }
		</Notice>
	);
};

export default GlobalStylesNotice;
