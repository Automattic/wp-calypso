import { getDesignPreviewUrl } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
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
	header?: Pattern;
	sections?: Pattern[];
	footer?: Pattern;
}

const PatternAssemblerPreview = ( { header, sections, footer }: Props ) => {
	const locale = useLocale();
	const translate = useTranslate();
	const site = useSite();
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const mergedDesign = {
		...selectedDesign,
		recipe: {
			...selectedDesign?.recipe,
			pattern_ids: sections ? sections.map( ( pattern ) => encodePatternId( pattern.id ) ) : [],
			header_pattern_ids: header ? [ encodePatternId( header.id ) ] : undefined,
			footer_pattern_ids: footer ? [ encodePatternId( footer.id ) ] : undefined,
		},
	} as Design;

	return (
		<div className="pattern-assembler-preview">
			<WebPreview
				showPreview
				showClose={ false }
				showEdit={ false }
				previewUrl={ getDesignPreviewUrl( mergedDesign, {
					language: locale,
				} ) }
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
