import { Card } from '@automattic/components';
import PropTypes from 'prop-types';
import CardHeading from 'calypso/components/card-heading';
import ConnectDomainStepProgress from './connect-domain-step-progress';
import { stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepWrapper( {
	className,
	heading,
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
		<Card className={ className }>
			<CardHeading className={ className + '__heading' }>{ heading }</CardHeading>
			{ showProgress && StepsProgress }
			{ stepContent }
		</Card>
	);
}

ConnectDomainStepWrapper.propTypes = {
	className: PropTypes.string,
	heading: PropTypes.string,
	progressStepList: PropTypes.object.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	stepContent: PropTypes.element,
};
