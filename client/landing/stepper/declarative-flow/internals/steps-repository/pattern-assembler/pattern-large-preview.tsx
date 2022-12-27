import { PatternRenderer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-large-preview.scss';

interface Props {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
}

const PatternLargePreview = ( { header, sections, footer }: Props ) => {
	const translate = useTranslate();
	const hasSelectedPattern = header || sections.length || footer;

	return (
		<DeviceSwitcher className="pattern-large-preview" isShowDeviceSwitcherToolbar isShowFrameBorder>
			{ hasSelectedPattern ? (
				<ul className="pattern-large-preview__patterns">
					{ header && (
						<li key="header">
							<PatternRenderer patternId={ encodePatternId( header.id ) } />
						</li>
					) }
					{ sections.map( ( pattern ) => (
						<li key={ pattern.key }>
							<PatternRenderer patternId={ encodePatternId( pattern.id ) } />
						</li>
					) ) }
					{ footer && (
						<li key="footer">
							<PatternRenderer patternId={ encodePatternId( footer.id ) } />
						</li>
					) }
				</ul>
			) : (
				<div className="pattern-large-preview__placeholder">
					<Icon className="pattern-large-preview__placeholder-icon" icon={ layout } size={ 72 } />
					<h2>{ translate( 'Welcome to your blank canvas' ) }</h2>
					<span>
						{ translate( "It's time to get creative. Add your first pattern to get started." ) }
					</span>
				</div>
			) }
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
