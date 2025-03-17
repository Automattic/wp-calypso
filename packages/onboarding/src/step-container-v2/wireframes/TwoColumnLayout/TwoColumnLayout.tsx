import clsx from 'clsx';
import {
	StepContainerV2,
	type StepContainerV2ContentProp,
	type StepContainerV2Props,
} from '../../components/StepContainerV2/StepContainerV2';

import './style.scss';

interface TwoColumnLayoutProps extends Omit< StepContainerV2Props, 'content' > {
	mainContent: StepContainerV2ContentProp;
	rightContent: StepContainerV2ContentProp;
	firstColumnWidth: number;
	secondColumnWidth: number;
}

export const TwoColumnLayout = ( props: TwoColumnLayoutProps ) => {
	const {
		mainContent,
		rightContent,
		className,
		width,
		firstColumnWidth,
		secondColumnWidth,
		...rest
	} = props;

	return (
		<StepContainerV2
			{ ...rest }
			className={ clsx( 'step-container-v2__content--two-column-layout', className ) }
			content={ ( context ) => (
				<>
					<div className="two-column-layout__main" style={ { flex: props.firstColumnWidth } }>
						{ typeof mainContent === 'function' ? mainContent( context ) : mainContent }
					</div>
					<div className="two-column-layout__right" style={ { flex: props.secondColumnWidth } }>
						{ typeof rightContent === 'function' ? rightContent( context ) : rightContent }
					</div>
				</>
			) }
		/>
	);
};
