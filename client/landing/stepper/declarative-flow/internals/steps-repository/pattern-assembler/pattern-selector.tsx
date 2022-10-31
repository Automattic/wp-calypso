import { Button, Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useSite } from '../../../../hooks/use-site';
import { ONBOARD_STORE } from '../../../../stores';
import PatternPreviewAutoHeight from './pattern-preview-auto-height';
import { getPatternPreviewUrl, handleKeyboard } from './utils';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[] | null;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	title: string | null;
	show: boolean;
};

const PatternSelector = ( { patterns, onSelect, onBack, title, show }: PatternSelectorProps ) => {
	const locale = useLocale();
	const patternSelectorRef = useRef< HTMLDivElement >( null );
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const translate = useTranslate();
	const site = useSite();

	useEffect( () => {
		if ( show ) {
			patternSelectorRef.current?.focus();
			patternSelectorRef.current?.removeAttribute( 'tabindex' );
		}
	}, [ show ] );

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
					{ patterns?.map( ( item: Pattern, index: number ) => (
						<PatternPreviewAutoHeight
							key={ `${ index }-${ item.id }` }
							url={ getPatternPreviewUrl( {
								id: item.id,
								language: locale,
								siteTitle: site?.name,
								stylesheet: selectedDesign?.recipe?.stylesheet,
							} ) }
							patternId={ item.id }
							patternName={ item.name }
						>
							<div
								aria-label={ item.name }
								tabIndex={ show ? 0 : -1 }
								role="option"
								title={ item.name }
								aria-selected={ false }
								onClick={ () => onSelect( item ) }
								onKeyUp={ handleKeyboard( () => onSelect( item ) ) }
							/>
						</PatternPreviewAutoHeight>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default PatternSelector;
