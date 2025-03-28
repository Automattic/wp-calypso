import clsx from 'clsx';
import {
	StepContainerV2,
	type StepContainerV2Props,
} from '../../components/StepContainerV2/StepContainerV2';

import './style.scss';

interface CenteredColumnLayoutProps extends StepContainerV2Props {
	columnWidth: 4 | 5 | 6 | 8 | 10;
}

export const CenteredColumnLayout = ( props: CenteredColumnLayoutProps ) => {
	const { columnWidth, className, ...rest } = props;

	return (
		<StepContainerV2
			{ ...rest }
			className={ clsx(
				'step-container-v2__content--centered-column-layout',
				`step-container-v2__content--centered-column-layout-${ columnWidth }`,
				className
			) }
		/>
	);
};
