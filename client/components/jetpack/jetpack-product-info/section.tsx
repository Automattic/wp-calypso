import { FoldableCard } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { FunctionComponent, ReactNode, useLayoutEffect, useRef, useState } from 'react';

// `title` is required, except if the section is always expanded
type Props = (
	| {
			alwaysExpanded?: false;
			title: string;
	  }
	| {
			alwaysExpanded: true;
			title?: string;
	  }
) & {
	children: ReactNode;
};

const JetpackProductInfoSection: FunctionComponent< Props > = ( {
	alwaysExpanded = false,
	title,
	children,
} ) => {
	const isMobileViewport = useMobileBreakpoint();

	const ref = useRef< HTMLDivElement | null >( null );
	const [ contentStyle, setContentStyle ] = useState( {} );

	useLayoutEffect( () => {
		const height = ref?.current?.scrollHeight || 250;
		setContentStyle( { maxHeight: `${ height }px` } );
	}, [ setContentStyle ] );

	return (
		<div className="jetpack-product-info__section" key={ title }>
			{ isMobileViewport && ! alwaysExpanded ? (
				<FoldableCard
					hideSummary
					header={ title }
					clickableHeader
					smooth
					contentExpandedStyle={ contentStyle }
					expanded
				>
					<div ref={ ref }>{ children }</div>
				</FoldableCard>
			) : (
				<>
					<h3 className="jetpack-product-info__section-title">{ title }</h3>

					{ children }
				</>
			) }
		</div>
	);
};

export default JetpackProductInfoSection;
