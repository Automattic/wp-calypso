import { PatternsRenderer } from '@automattic/blocks-renderer';
import { DeviceSwitcher } from '@automattic/design-picker';
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
					<span>{ translate( 'Your page is blank. Start adding content on the left.' ) }</span>
				</div>
			) }
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
