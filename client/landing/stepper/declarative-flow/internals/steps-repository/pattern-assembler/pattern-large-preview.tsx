import { PatternsRenderer } from '@automattic/blocks-renderer';
import { DeviceSwitcher } from '@automattic/design-picker';
import { Icon, layout } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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
	const patternIds = useMemo(
		() =>
			[ header, ...sections, footer ]
				.filter( Boolean )
				.map( ( pattern ) => encodePatternId( pattern!.id ) ),
		[ header, sections, footer ]
	);

	return (
		<DeviceSwitcher className="pattern-large-preview" isShowDeviceSwitcherToolbar isShowFrameBorder>
			{ patternIds.length > 0 ? (
				<div className="pattern-large-preview__patterns">
					<PatternsRenderer patternIds={ patternIds } />
				</div>
			) : (
				<div className="pattern-large-preview__placeholder">
					<Icon className="pattern-large-preview__icon" icon={ layout } size={ 72 } />
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
