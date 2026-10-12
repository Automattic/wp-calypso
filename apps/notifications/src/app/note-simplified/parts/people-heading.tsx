import {
	__experimentalDivider as Divider,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
} from '@wordpress/components';

/** Titles the list of people who acted, which then stands in for the headline. */
export default function PeopleHeading( { children }: { children: string } ) {
	return (
		<VStack spacing={ 3 }>
			<Heading level={ 3 } size={ 15 } weight={ 600 }>
				{ children }
			</Heading>
			<Divider className="wpnc-simplified__divider" />
		</VStack>
	);
}
