import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

type Props = {
	isPrimary?: boolean;
	onClick: () => void;
};

export default function PatternAssemblerButton( { isPrimary, onClick }: Props ) {
	const translate = useTranslate();

	return (
		<Button className="themes__pattern-assembler-button" primary={ isPrimary } onClick={ onClick }>
			{ translate( 'Design your own' ) }
		</Button>
	);
}
