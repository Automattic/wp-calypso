import clsx from 'clsx';
import {
	StepContainerV2,
	type StepContainerV2Props,
} from '../../components/StepContainerV2/StepContainerV2';
import type { StepContainerV2InternalContextType } from '../../contexts/StepContainerV2InternalContext';

import './style.scss';

interface ThreeColumnsOnRightLayoutProps extends Omit< StepContainerV2Props, 'render' > {
	renderMain: ( context: StepContainerV2InternalContextType ) => React.ReactNode;
	renderRight: ( context: StepContainerV2InternalContextType ) => React.ReactNode;
}

export const ThreeColumnsOnRightLayout = ( props: ThreeColumnsOnRightLayoutProps ) => {
	const { renderMain, renderRight, className, width, ...rest } = props;

	return (
		<StepContainerV2
			{ ...rest }
			className={ clsx( 'step-container-v2__content--three-columns-on-right-layout', className ) }
			render={ ( context ) => (
				<>
					<div className="three-columns-on-right-layout__main">{ renderMain( context ) }</div>
					<div className="three-columns-on-right-layout__right">{ renderRight( context ) }</div>
				</>
			) }
		/>
	);
};
