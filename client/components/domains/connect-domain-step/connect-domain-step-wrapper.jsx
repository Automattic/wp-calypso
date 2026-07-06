import PropTypes from 'prop-types';
import ConnectDomainStepProgress from './connect-domain-step-progress';
import { stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepWrapper( {
	className,
	progressStepList,
	pageSlug,
	stepContent,
} ) {
	const StepsProgress = (
		<ConnectDomainStepProgress
			baseClassName={ className }
			steps={ progressStepList }
			pageSlug={ pageSlug }
		/>
	);
	const showProgress = Object.keys( progressStepList ).includes( pageSlug );

	return (
		<div className={ className }>
			{ showProgress && StepsProgress }
			{ stepContent }
		</div>
	);
}

ConnectDomainStepWrapper.propTypes = {
	className: PropTypes.string,
	heading: PropTypes.string,
	progressStepList: PropTypes.object.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	stepContent: PropTypes.element,
};
