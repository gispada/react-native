//   Copyright © 2017 PSPDFKit GmbH. All rights reserved.
//
//   THIS SOURCE CODE AND ANY ACCOMPANYING DOCUMENTATION ARE PROTECTED BY INTERNATIONAL COPYRIGHT LAW
//   AND MAY NOT BE RESOLD OR REDISTRIBUTED. USAGE IS BOUND TO THE PSPDFKIT LICENSE AGREEMENT.
//   UNAUTHORIZED REPRODUCTION OR DISTRIBUTION IS SUBJECT TO CIVIL AND CRIMINAL PENALTIES.
//   This notice may not be removed from this file.
//

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  ListView,
  NativeModules,
  processColor,
  PermissionsAndroid,
  Dimensions
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import PSPDFKitView from 'react-native-pspdfkit'

var PSPDFKit = NativeModules.PSPDFKit;

const pspdfkitColor = '#267AD4'
const pspdfkitColorAlpha = '#267AD450'

const DOCUMENT = 'file:///sdcard/Annual Report.pdf';
const CONFIGURATION = {
  startPage : 3,
  scrollContinuously : false,
  showPageNumberOverlay : true,
  grayScale : true,
  showPageLabels : false,
  pageScrollDirection : "vertical",
  showThumbnailBar : "scrollable"
};

var examples = [
  {
    name: "Open assets document",
    description: 'Open document from your project assets folder',
    action: () => {
      PSPDFKit.present('file:///android_asset/Annual Report.pdf', {})
      PSPDFKit.setPageIndex(3, false)
    }
  },
  {
    name: "Open local document",
    description: 'Opens document from external storage directory.',
    action: () => {
      requestExternalStoragePermission(function () { PSPDFKit.present(DOCUMENT, {}); });
    }
  },
  {
    name: "Configuration Builder",
    description: "You can configure the builder with dictionary representation of the PSPDFConfiguration object.",
    action: () => {
      requestExternalStoragePermission(function () { PSPDFKit.present(DOCUMENT, CONFIGURATION) });
    }
  },
  {
    name: 'PDF View Component',
    description: 'Show how to use the PSPDFKitView component with react-navigation.',
    action: component => {
      component.props.navigation.navigate('PdfView')
    },
  },
  {
    name: "Debug Log",
    description: "Action used for printing stuff during development and debugging.",
    action: () => {
      console.log(PSPDFKit)
      console.log(PSPDFKit.versionString)
      // console.log(NativeModules)
    }
  }
]

async function requestExternalStoragePermission(callback) {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Write external storage permission granted")
      callback()
    } else {
      console.log("Write external storage permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}

class CatalogScreen extends Component<{}> {
  // Initialize the hardcoded data
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(examples)
    };
  }
  
  render() {
    return (
      <View style={styles.page}>
        <View style={styles.header}>
          <Image source={require('./assets/logo-flat.png')} style={styles.logo} />
          <Text style={styles.version}>{PSPDFKit.versionString}</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderSeparator={this._renderSeparator}
          contentContainerStyle={styles.listContainer}
          style={styles.list}
        />
      </View>
    );
  }
  
  _renderSeparator(sectionId, rowId) {
    return (
      <View key={rowId} style={styles.separator} />
    );
  }
  
  _renderRow = example => {
    return (
      <TouchableHighlight 
        onPress={() => {
          example.action(this)
        }} 
        style={styles.row} underlayColor='#209cca50'>
        <View style={styles.rowContent}>
          <Text style={styles.name}>{example.name}</Text>
          <Text style={styles.description}>{example.description}</Text>
        </View>
      </TouchableHighlight>
    )
  }
}

class PdfViewScreen extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = { dimensions: undefined }
  }

  render() {
    const layoutDirection = this._getOptimalLayoutDirection()
    return (
      <View
        style={{ flex: 1, flexDirection: layoutDirection, justifyContent: 'center' }}
        onLayout={this._onLayout}
      >
        <PSPDFKitView
          document='file:///android_asset/Annual Report.pdf'
          configuration={{
            backgroundColor: processColor('lightgrey'),
            thumbnailBarMode: 'scrollable',
          }}
          pageIndex={4}
          showCloseButton={true}
          fragmentTag='PDF1'
          onCloseButtonPressed={this.props.onClose}
          style={{ flex: 1, color: pspdfkitColor }}
        />
        <PSPDFKitView
          document='file:///android_asset/Business Report.pdf'
          configuration={{
            pageTransition: 'scrollContinuous',
            scrollDirection: 'vertical',
            pageMode: 'single',
          }}
          fragmentTag='PDF2'
          style={{ flex: 1, color: '#9932CC' }}
        />
      </View>
    )
  }

  _getOptimalLayoutDirection = () => {
    const width = this.state.dimensions
      ? this.state.dimensions.width
      : Dimensions.get('window').width
    return width > 450 ? 'row' : 'column'
  }

  _onLayout = event => {
    let { width, height } = event.nativeEvent.layout
    this.setState({ dimensions: { width, height } })
  }
}

export default StackNavigator(
  {
    Catalog: {
      screen: CatalogScreen,
    },
    PdfView: {
      screen: PdfViewScreen,
    },
  },
  {
    initialRouteName: 'Catalog',
  }
);



var styles = StyleSheet.create({
  separator: {
    height: 0.5,
    backgroundColor: '#ccc',
    marginLeft: 10
  },
  page: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#eee'
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc'
  },
  version: {
    color: '#666666',
    marginTop: 10,
    marginBottom: 20
  },
  logo: {
    marginTop: 40
  },
  listContainer: {
    backgroundColor: 'white',
  },
  list: {
  },
  name: {
    color: '#209cca',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4
  },
  description: {
    color: "#666666",
    fontSize: 12
  },
  rowContent: {
    padding: 10
  }
});