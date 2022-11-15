import { BlocksRenderer } from '@automattic/blocks-renderer';
import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useSite } from '../../../../hooks/use-site';
import useQueryPatterns from './use-query-patterns';
import { handleKeyboard } from './utils';
import type { Pattern } from './types';

type PatternSelectorProps = {
	stylesheet?: string;
	patternIds: number[];
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	title: string | null;
	show: boolean;
	selectedPattern: Pattern | null;
};

const PatternSelector = ( {
	stylesheet = '',
	patternIds,
	onSelect,
	onBack,
	title,
	show,
	selectedPattern,
}: PatternSelectorProps ) => {
	const patternSelectorRef = useRef< HTMLDivElement >( null );
	const translate = useTranslate();
	const site = useSite();
	const { data: patterns } = useQueryPatterns( site?.ID, stylesheet, patternIds );

	useEffect( () => {
		if ( show ) {
			patternSelectorRef.current?.focus();
			patternSelectorRef.current?.removeAttribute( 'tabindex' );
		}
	}, [ show ] );

	if ( ! patterns ) {
		return null;
	}

	return (
		<div
			className={ classnames( 'pattern-selector', {
				'pattern-selector--active': show,
				'pattern-selector--hide': ! show,
			} ) }
			// eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
			tabIndex={ show ? 0 : -1 }
			ref={ patternSelectorRef }
		>
			<div className="pattern-selector__header">
				<Button borderless={ true } title={ translate( 'Back' ) } onClick={ onBack }>
					<Gridicon icon="chevron-left" size={ 16 } />
				</Button>
				<h1>{ title }</h1>
			</div>
			<div className="pattern-selector__body">
				<div className="pattern-selector__block-list" role="listbox">
					{ patterns.map( ( pattern: Pattern ) => (
						<div
							key={ pattern.ID }
							aria-label={ pattern.title }
							tabIndex={ show ? 0 : -1 }
							role="option"
							title={ pattern.title }
							aria-selected={ pattern.ID === selectedPattern?.ID }
							className={ classnames( 'pattern-selector__block-list-item', {
								'pattern-selector__block-list-item--selected-pattern':
									pattern.ID === selectedPattern?.ID,
							} ) }
							onClick={ () => onSelect( pattern ) }
							onKeyUp={ handleKeyboard( () => onSelect( pattern ) ) }
						>
							<BlocksRenderer
								html={ pattern.html }
								styles={ pattern.styles }
								viewportWidth={ 1060 }
							/>
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default PatternSelector;
