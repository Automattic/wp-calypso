import { Button } from '@automattic/components';
import { PremiumBadge } from '@automattic/design-picker';
import { useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element';
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

	useLayoutEffect( () => {
		if ( ! observerRef.current ) {
			return;
		}

		const resizeObserver = new ResizeObserver( ( [ observerNode ] ) => {
			const node = observerNode.target;
			const nodeFirstChildRect = ( node.firstChild as HTMLElement )?.getBoundingClientRect();
			const nodeLastChildRect = ( node.lastChild as HTMLElement )?.getBoundingClientRect();
			if ( ! nodeFirstChildRect || ! nodeLastChildRect ) {
				return;
			}

			// Detect flex wrap.
			setIsCollapsible( nodeFirstChildRect.top !== nodeLastChildRect.top );
			setCollapsibleMaxHeight( isCollapsed ? nodeFirstChildRect.height : node.scrollHeight );
		} );

		resizeObserver.observe( observerRef.current );
		return () => {
			resizeObserver.disconnect();
		};
	}, [ isCollapsed ] );

	// Ensure to start collapsed when collapsible, and vice-versa.
	useEffect( () => {
		setIsCollapsed( isCollapsible );
	}, [ isCollapsible ] );

	const handleCollapseButtonClick = () => {
		setIsCollapsed( ! isCollapsed );
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
					onClick={ onClick }
				/>
			</div>
		</div>
	);
};

export default ThemeStyleVariations;
