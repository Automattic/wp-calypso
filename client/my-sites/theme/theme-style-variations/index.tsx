import { Button } from '@automattic/components';
import { PremiumBadge } from '@automattic/design-picker';
import { useLayoutEffect, useRef, useState } from '@wordpress/element';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import type { StyleVariation } from '@automattic/design-picker/src/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ThemeStyleVariationsProps {
	description: TranslateResult;
	selectedVariation: StyleVariation;
	variations: StyleVariation[];
	onClick: ( variation: StyleVariation ) => void;
}

const ThemeStyleVariations = ( {
	description,
	selectedVariation,
	variations,
	onClick,
}: ThemeStyleVariationsProps ) => {
	const observerRef = useRef< HTMLDivElement | null >( null );
	const [ collapsibleMaxHeight, setCollapsibleMaxHeight ] = useState< number | undefined >();
	const [ isCollapsible, setIsCollapsible ] = useState< boolean >( false );
	const [ isCollapsed, setIsCollapsed ] = useState< boolean >( false );
	const isCollapsibleRef = useRef( false );
	const isCollapsedRef = useRef( false );

	isCollapsibleRef.current = isCollapsible;
	isCollapsedRef.current = isCollapsed;

	const updateCollapsibleMaxHeight = ( shouldCollapse: boolean ) => {
		const node = observerRef.current;
		const nodeFirstChild = node?.firstChild as HTMLElement;
		if ( ! node || ! nodeFirstChild ) {
			return null;
		}

		setCollapsibleMaxHeight( shouldCollapse ? nodeFirstChild.offsetHeight : node.scrollHeight );
	};

	useLayoutEffect( () => {
		if ( ! observerRef.current ) {
			return;
		}

		const resizeObserver = new ResizeObserver( ( [ observerNode ] ) => {
			const node = observerNode.target;
			const nodeFirstChild = node.firstChild as HTMLElement;
			const nodeLastChild = node.lastChild as HTMLElement;
			if ( ! nodeFirstChild || ! nodeLastChild ) {
				return;
			}

			// Detect flex wrap.
			const currentIsCollapsible = nodeLastChild.offsetTop > nodeFirstChild.offsetTop;
			const shouldCollapse =
				isCollapsibleRef.current !== currentIsCollapsible || isCollapsedRef.current;

			setIsCollapsible( currentIsCollapsible );
			setIsCollapsed( shouldCollapse );
			updateCollapsibleMaxHeight( shouldCollapse );
		} );

		resizeObserver.observe( observerRef.current );
		return () => {
			resizeObserver.disconnect();
		};
	}, [] );

	const handleCollapseButtonClick = () => {
		const shouldCollapse = ! isCollapsed;

		setIsCollapsed( shouldCollapse );
		updateCollapsibleMaxHeight( shouldCollapse );
	};

	return (
		<div className="theme__sheet-style-variations">
			<div className="theme__sheet-style-variations-header">
				<h2>
					{ translate( 'Styles' ) }
					<PremiumBadge shouldHideTooltip />
					{ isCollapsible && (
						<Button borderless onClick={ handleCollapseButtonClick }>
							{ isCollapsed ? translate( 'Show all' ) : translate( 'Show less' ) }
						</Button>
					) }
				</h2>
				<p>{ description }</p>
			</div>
			<div
				className={ classNames( 'theme__sheet-style-variations-previews', {
					'theme__sheet-style-variations-previews--is-collapsible': isCollapsible,
					'theme__sheet-style-variations-previews--is-collapsed': isCollapsed,
				} ) }
				style={ {
					...( isCollapsible && { maxHeight: collapsibleMaxHeight } ),
				} }
				ref={ observerRef }
			>
				<AsyncLoad
					require="@automattic/design-preview/src/components/style-variation"
					placeholder={ null }
					selectedVariation={ selectedVariation }
					variations={ variations }
					showOnlyHoverViewDefaultVariation
					onClick={ onClick }
				/>
			</div>
		</div>
	);
};

export default ThemeStyleVariations;
