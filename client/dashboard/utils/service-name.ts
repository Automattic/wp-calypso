import type { InstanceType } from '../app/context';

export function getServiceName( type: InstanceType ) {
	switch ( type ) {
		case 'dotcom':
			return 'WordPress.com';
		case 'a4a':
			return 'A4A';
	}
}
