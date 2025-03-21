import clsx from 'clsx';
import { Children, isValidElement, Fragment } from 'react';
import {
	StepContainerV2,
	type StepContainerV2Props,
} from '../../components/StepContainerV2/StepContainerV2';

import './style.scss';

interface TwoColumnLayoutProps extends StepContainerV2Props {
	firstColumnWidth: number;
	secondColumnWidth: number;
}

export const TwoColumnLayout = ( props: TwoColumnLayoutProps ) => {
	const { className, firstColumnWidth, secondColumnWidth, children, ...rest } = props;

	const getChildFlexGrow = ( index: number ) => {
		switch ( index ) {
			case 0:
				return firstColumnWidth;
			case 1:
				return secondColumnWidth;
			default:
				return undefined;
		}
	};

	return (
		<StepContainerV2
			{ ...rest }
			className={ clsx( 'step-container-v2__content--two-column-layout', className ) }
		>
			{ ( context ) => {
				let childElements = typeof children === 'function' ? children( context ) : children;
				if ( isValidElement( childElements ) && childElements.type === Fragment ) {
					childElements = childElements.props.children;
				}

				return Children.map( childElements, ( child, index ) => {
					if ( ! isValidElement( child ) ) {
						return null;
					}

					return <div style={ { flex: getChildFlexGrow( index ) } }>{ child }</div>;
				} );
			} }
		</StepContainerV2>
	);
};
