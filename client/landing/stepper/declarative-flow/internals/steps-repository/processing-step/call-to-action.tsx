import { Button, Gridicon } from '@automattic/components';

type ProcessingCallToActionProps = {
	title: string;
	description: string;
	label: string;
	href: string;
	onClick: () => void;
};

export default function ProcessingCallToAction( {
	title,
	description,
	label,
	href,
	onClick,
}: ProcessingCallToActionProps ) {
	return (
		<div className="processing-step__call-to-action">
			<h2 className="processing-step__call-to-action-title">{ title }</h2>
			<p className="processing-step__call-to-action-description">{ description }</p>
			<Button compact href={ href } target="_blank" rel="noopener noreferrer" onClick={ onClick }>
				{ label }
				<Gridicon icon="external" size={ 16 } />
			</Button>
		</div>
	);
}
