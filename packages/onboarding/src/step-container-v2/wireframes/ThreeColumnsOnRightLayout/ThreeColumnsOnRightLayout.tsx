import clsx from 'clsx';
import {
	StepContainerV2,
	type StepContainerV2ContentProp,
	type StepContainerV2Props,
} from '../../components/StepContainerV2/StepContainerV2';

import './style.scss';

interface ThreeColumnsOnRightLayoutProps extends Omit< StepContainerV2Props, 'content' > {
	mainContent: StepContainerV2ContentProp;
	rightContent: StepContainerV2ContentProp;
}

export const ThreeColumnsOnRightLayout = ( props: ThreeColumnsOnRightLayoutProps ) => {
	const { mainContent, rightContent, className, width, ...rest } = props;

	return (
		<StepContainerV2
			{ ...rest }
			className={ clsx( 'step-container-v2__content--three-columns-on-right-layout', className ) }
			content={ ( context ) => (
				<>
					<div className="three-columns-on-right-layout__main">
						{ typeof mainContent === 'function' ? mainContent( context ) : mainContent }
					</div>
					<div className="three-columns-on-right-layout__right">
						{ typeof rightContent === 'function' ? rightContent( context ) : rightContent }
					</div>
				</>
			) }
		/>
	);
};
