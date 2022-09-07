import { getDesignPreviewUrl } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import WebPreview from 'calypso/components/web-preview/content';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE } from '../../../../stores';
import PreviewToolbar from '../design-setup/preview-toolbar';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import type { Design } from '@automattic/design-picker';
import './pattern-assembler-preview.scss';

interface Props {
	header: Pattern | null;
	sections?: Pattern[];
	footer: Pattern | null;
}

const PatternAssemblerPreview = ( { header, sections = [], footer }: Props ) => {
	const locale = useLocale();
	const translate = useTranslate();
	const site = useSite();
	const [ webPreviewFrameContainer, setWebPreviewFrameContainer ] = useState< Element | null >(
		null
	);

	const hasSelectedPatterns = header || sections.length > 0 || footer;
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );

	const mergedDesign = {
		...selectedDesign,
		recipe: {
			...selectedDesign?.recipe,
			// The blank canvas blocks demo site doesn't have the header, so we inject the header into the first pattern
			// of the content.
			pattern_ids: [ header, ...sections ]
				.filter( Boolean )
				.map( ( pattern ) => encodePatternId( pattern!.id ) ),
			footer_pattern_ids: footer ? [ encodePatternId( footer.id ) ] : undefined,
		},
	} as Design;

	useEffect( () => {
		setWebPreviewFrameContainer( document.querySelector( '.web-preview__frame-wrapper' ) );
	}, [] );

	return (
		<div
			className={ classnames( 'pattern-assembler-preview', {
				'pattern-assembler-preview--has-selected-patterns': hasSelectedPatterns,
			} ) }
		>
			{ webPreviewFrameContainer &&
				ReactDOM.createPortal(
					<div
						className={ classnames(
							'pattern-assembler-preview__placeholder',
							'web-preview__frame'
						) }
					>
						{ ! hasSelectedPatterns && (
							<span>{ translate( 'Your page is blank. Start adding content on the left' ) }</span>
						) }
					</div>,
					webPreviewFrameContainer
				) }
			<WebPreview
				showPreview
				showClose={ false }
				showEdit={ false }
				previewUrl={
					hasSelectedPatterns
						? getDesignPreviewUrl( mergedDesign, {
								language: locale,
						  } )
						: 'about:blank'
				}
				loadingMessage={
					// @ts-expect-error The `className` property doesn't listed on the type definition
					<Spinner className="pattern-assembler-preview__spinner" />
				}
				toolbarComponent={ PreviewToolbar }
				siteId={ site?.ID }
				url={ site?.URL }
				translate={ translate }
				recordTracksEvent={ recordTracksEvent }
			/>
		</div>
	);
};

export default PatternAssemblerPreview;
