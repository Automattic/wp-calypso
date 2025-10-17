import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import BranchIcon from '../deployments/icons/branch';

interface BranchDisplayProps {
	branchName: string;
	color?: string;
}

export function BranchDisplay( { branchName, color = '#3b3b3b' }: BranchDisplayProps ) {
	return (
		<HStack spacing={ 1 } alignment="left" style={ { width: 'auto', color } }>
			<BranchIcon width={ 16 } height={ 16 } style={ { flexShrink: 0 } } />
			<Text
				as="code"
				size="small"
				truncate
				numberOfLines={ 1 }
				style={ {
					color,
				} }
			>
				{ branchName }
			</Text>
		</HStack>
	);
}
