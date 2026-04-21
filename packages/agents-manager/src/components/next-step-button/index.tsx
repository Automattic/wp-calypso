import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { zoomIn } from '../../utils/canvas-zoom';
import './style.scss';

interface Props {
	onMoveToNextStep: ( message: string ) => void | Promise< void >;
}

export default function NextStepButton( { onMoveToNextStep }: Props ) {
	const handleClick = async () => {
		zoomIn();
		await onMoveToNextStep( 'Moving to next step' );
	};

	return (
		<Button className="agents-manager-next-step-button" variant="primary" onClick={ handleClick }>
			{ __( 'Move to next step', '__i18n_text_domain__' ) }
		</Button>
	);
}
