import * as React from 'react';
import { useEffect } from 'react';
import {
  NavigationContainer,
  LinkingOptions,
  RouteProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import dynamicLinks from '@react-native-firebase/dynamic-links';

type RootStackParamList = {
  Home: undefined;
  Details: { id?: number };
};

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['rnlinkdemo://', 'https://rnlinkdemo.page.link'],
  config: {
    screens: {
      Home: 'home',
      Details: 'details/:id?',
    },
  },
};

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', { id: 42 })}
      />
    </View>
  );
}

function DetailsScreen({ route }: { route: DetailsScreenRouteProp }) {
  const { id } = route.params || {};

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20 }}>Details Screen</Text>
      <Text>ID: {id ? id : 'No ID provided'}</Text>
    </View>
  );
}

export default function App() {
  const handleDynamicLink = (link: any) => {
    if (link?.url) {
      console.log('Received link:', link.url);

      try {
        // Use the WHATWG URL API if available
        let url: any;

        if (typeof URL !== 'undefined') {
          url = new URL(link.url);
        } else {
          // Fallback for React Native environments
          const match = link.url.match(/:\/\/([^/]+)\/([^/]+)\/?(\d+)?/);
          if (match) {
            const [, host, screen, id] = match;
            if (screen === 'details' && id) {
              navigationRef.current?.navigate('Details', { id: Number(id) });
            }
          }
          return;
        }

        // If URL parsing works normally
        const pathSegments = url.pathname?.split('/') ?? [];
        const screen = pathSegments[1];
        const id = pathSegments[2];

        if (screen === 'details' && id) {
          navigationRef.current?.navigate('Details', { id: Number(id) });
        }
      } catch (error) {
        console.warn('Error parsing dynamic link:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
    dynamicLinks().getInitialLink().then(handleDynamicLink);
    return () => unsubscribe();
  }, []);

  const navigationRef = React.useRef<any>(null);

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      fallback={<Text>Loading...</Text>}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
