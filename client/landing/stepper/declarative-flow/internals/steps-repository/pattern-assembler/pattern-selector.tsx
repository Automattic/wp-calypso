import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { ONBOARD_STORE } from '../../../../stores';
import type { Pattern } from './types';

type PatternSelectorProps = {
	patterns: Pattern[];
	onSelect: ( selectedPattern: Pattern | null ) => void;
	onBack: () => void;
	title: string | null;
	show: boolean;
	selectedPattern: Pattern | null;
};

const PatternSelector = ( {
	patterns,
	onSelect,
	onBack,
	title,
	show,
	selectedPattern,
}: PatternSelectorProps ) => {
	const patternSelectorRef = useRef< HTMLDivElement >( null );
	const translate = useTranslate();
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const stylesheet = selectedDesign?.recipe?.stylesheet || '';
	const patternListProps = {
		patterns,
		selectedPattern,
		show,
		onSelect,
	};

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
				{ isEnabled( 'pattern-assembler/client-side-render' ) ? (
					<AsyncLoad require="./pattern-list-renderer" { ...patternListProps } />
				) : (
					<AsyncLoad require="./pattern-list" { ...patternListProps } stylesheet={ stylesheet } />
				) }
			</div>
		</div>
	);
};

export default PatternSelector;
