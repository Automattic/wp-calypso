import { Card } from '../';
import './style.scss';

export type BaseCardProps = {
	heading?: React.ReactNode;
	children?: React.ReactNode;
};

export default function BaseCard( { heading, children }: BaseCardProps ) {
	return (
		<Card className="highlight-card">
			{ heading ? <div className="highlight-card-heading">{ heading }</div> : null }
			{ children ? <div className="highlight-card-body">{ children }</div> : null }
		</Card>
	);
}
