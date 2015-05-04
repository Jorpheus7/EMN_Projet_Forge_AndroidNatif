angular.module('starter.controllers', [])

.controller('MembersCtrl', function($scope, $ionicModal, $http, $stateParams, $rootScope, $location, $ionicLoading) {
	
	/*----------------------------------------------------------------------*
	 *--------------------------- INITIALISATION ---------------------------*
	 *----------------------------------------------------------------------*/
	
	var baseURL = "https://iswear-box.herokuapp.com"
	
	$rootScope.members = {};
	getMembers();
	$ionicLoading.hide();

	/*----------------------------------------------------------------------*
	 *----------------------------- FUNCTIONS ------------------------------*
	 *----------------------------------------------------------------------*/
	
	//Increase the member debt
	//---------------------------------------------------
	$scope.increase = function (idt) {
		$http.put(baseURL +'/members/increase/'+idt, {})
		.success(function(data, status, headers, config){
			getMembers();
		})
		.error(function(data, status, headers, config){
		});
	};

	//Get the list of members
	//---------------------------------------------------
	function getMembers() {
		$http.get(baseURL +'/members')
		.success(function(data, status, headers, config){
			$rootScope.members = data;
		})
		.error(function(data, status, headers, config){
		});
	};
	
})

.controller('AdminCtrl', function($scope, $ionicModal, $http, $stateParams, $rootScope, $location, $ionicLoading, $ionicPopup) {
	
	/*----------------------------------------------------------------------*
	 *--------------------------- INITIALISATION ---------------------------*
	 *----------------------------------------------------------------------*/
	
	var baseURL = "https://iswear-box.herokuapp.com"
	
	$scope.idMember = $stateParams.idMember;

	$scope.amountTag = '';
	
	getMembers();
	getAmount();

	/*----------------------------------------------------------------------*
	 *----------------------------- FUNCTIONS ------------------------------*
	 *----------------------------------------------------------------------*/

	//Get the list of members
	//---------------------------------------------------
	function getMembers() {
		$http.get(baseURL +'/members')
		.success(function(data, status, headers, config){
			$rootScope.members = data;
		})
		.error(function(data, status, headers, config){
		});
	};

	//Get the penality amount
	//---------------------------------------------------
	function getAmount() {
		$http.get(baseURL +'/amount')
		.success(function(data, status, headers, config){
			$scope.amountTag = data;
		})
		.error(function(data, status, headers, config){
		});
	};
	
	//----------------------------------------------------------------------
    var pictureSource=navigator.camera.PictureSourceType;
    var destinationType=navigator.camera.DestinationType;
	var jcrop_api;

	//----------------------------------------------------------------------
	$scope.cropping = function() {
		jQuery('#target').Jcrop({
			onSelect: updateCoords
		}, function() {
			jcrop_api = this;
			jcrop_api.setSelect([0,0,200,200]);
			jcrop_api.setOptions({
				allowSelect: true,
				allowMove: true,
				allowResize: false,
				aspectRatio: 1/1,
				minSize: [ 200, 200 ],
				maxSize: [ 200, 200 ]
			});
			jcrop_api.focus();
		});
	};
	//----------------------------------------------------------------------
	function updateCoords(c)
	{
		document.getElementById('x').value = c.x;
		document.getElementById('y').value = c.y;
		document.getElementById('w').value = c.w;
		document.getElementById('h').value = c.h;
	};

	//----------------------------------------------------------------------
	$scope.crop = function() {
		var x = document.getElementById("x").value; 
		var y = document.getElementById("y").value; 
		var w = document.getElementById("w").value; 
		var h = document.getElementById("h").value;

		var canvas = document.createElement('canvas');
		canvas.width  = 200;
		canvas.height = 200;

  		var ctx = canvas.getContext('2d');
		ctx.drawImage(document.getElementById('target'), 0, y, w, h, 0, 0, 200, 200);
		updateImage(canvas.toDataURL());

		$scope.modalCrop.hide();
		$scope.modalData.src = '';
		jcrop_api.destroy();
	};

	//---------------------------------------------------------------------
	function updateImage(imageData) {
		//$ionicLoading.show({ template: "Chargement de la nouvelle image" });

	    imageData = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
		var dataObj = {
			image64 : imageData
		};			
	
		$http.put(baseURL + '/members/image/' + $scope.idImage, dataObj)
		.success(function (data, status, headers, config) {
			getMembers();
			//$ionicLoading.hide();
		})
		.error(function (data, status, headers, config) {
			$ionicLoading.show({
		      template: 'Error: ' + data,
	          noBackdrop: true,
		      duration: 1000
		    });
        });
	};
	
    // A button will call this function
    //-------------------------------------------------------------------------------
    $scope.capturePhoto = function (id) {
		$scope.idImage = id;
      // Take picture using device camera and retrieve image as base64-encoded string
      navigator.camera.getPicture(updateImage, onFail, {
      	quality: 50, 
        destinationType: destinationType.DATA_URL,
        correctOrientation : true,
        targetWidth: 200,
		targetHeight: 354
      });
      
    }

    // Get photo from PHOTOLIBRARY
    //---------------------------------------------------------------------
    $scope.getPhoto = function(id) {
    	$scope.idImage = id;
      // Retrieve image file location from specified source
      navigator.camera.getPicture(updateImage, onFail, {
      	quality: 50,
        destinationType: destinationType.DATA_URL,
        sourceType: pictureSource.PHOTOLIBRARY,
  		allowEdit : true,
		targetWidth: 200,
		targetHeight: 354,
 		saveToPhotoAlbum: true
	  });
    }
    
    // Called if something bad happens.
    //------------------------------------
    function onFail(message) {
    	$ionicLoading.show({
	      template: message,
	      noBackdrop: true,
	      duration: 1000
	    });
    }
	
	/*----------------------------------------------------------------------*
	 *-------------------------------- MODAL -------------------------------*
	 *----------------------------------------------------------------------*/
	
	// Form data for the modals
	$scope.modalData = {};
	

	/*--------------------------------MODIFY--------------------------------*/

	// Create the crop modal that we will use later
	$ionicModal.fromTemplateUrl('html/cropPicture.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalCrop = modal;
	});

	// Triggered in the crop modal to close it
	$scope.closeCrop = function() {
		$scope.modalCrop.hide();
		$scope.modalData.src = '';
		jcrop_api.destroy();
	};

	// Open the crop modal
	function openCrop(imagePath) {
		$scope.modalData.src = imagePath;
		$scope.modalCrop.show();
	};
	/*--------------------------------MODIFY--------------------------------*/
	
	// Create the modify modal that we will use later
	$ionicModal.fromTemplateUrl('html/modifyMember.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalModify = modal;
	});

	// Triggered in the modify modal to close it
	$scope.closeModify = function() {
		$scope.modalModify.hide();
		$scope.modalData.id = '';
		$scope.modalData.name = '';
		$scope.modalData.firstname = '';
	};

	// Open the modify modal
	$scope.modify = function(id, name, firstname) {
		$scope.modalData.id = id;
		$scope.modalData.name = name;
		$scope.modalData.firstname = firstname;
		$scope.modalModify.show();
	};

	// Perform the modify action when the user submits the modify form
	$scope.doModify = function() {
		var dataObj = {
				name : $scope.modalData.name,
				firstname : $scope.modalData.firstname
		};			

 		$http.put(baseURL + '/members/name/' + $scope.modalData.id, dataObj)
		.success(function(data, status, headers, config){
			getMembers();
			$scope.modalData.id = '';
			$scope.modalData.name = '';
			$scope.modalData.firstname = '';
			$scope.closeModify();
		})
		.error(function(data, status, headers, config){
		});
	};
	
	
	/*-------------------------------DISCHARGE------------------------------*/
	
	// Create the discharge modal that we will use later
	$ionicModal.fromTemplateUrl('html/dischargeMember.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalDischarge = modal;
	});

	// Triggered in the discharge modal to close it
	$scope.closeDischarge = function() {
		$scope.modalDischarge.hide();
		$scope.modalData.id = '';
		$scope.modalData.name = '';
		$scope.modalData.firstname = '';
	};
	
	// Open the discharge modal
	$scope.discharge = function(id, name, firstname) {
		$scope.modalData.id = id;
		$scope.modalData.name = name;
		$scope.modalData.firstname = firstname;
		$scope.modalDischarge.show();
	};
	
	// Perform the discharge action when the user submits it
	$scope.doDischarge = function () {
		$http.put(baseURL + '/members/discharge/'+ $scope.modalData.id, {})
		.success(function(data, status, headers, config){
			getMembers();
			$scope.modalData.id = '';
			$scope.modalData.name = '';
			$scope.modalData.firstname = '';
			$scope.closeDischarge();
		})
		.error(function(data, status, headers, config){
		});
	};
	
	/*--------------------------------DELETE--------------------------------*/

	// Create the delete modal that we will use later
	$ionicModal.fromTemplateUrl('html/deleteMember.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalDelete = modal;
	});

	// Triggered in the delete modal to close it
	$scope.closeDelete = function() {
		$scope.modalDelete.hide();
		$scope.modalData.id = '';
		$scope.modalData.name = '';
		$scope.modalData.firstname = '';
	};
	
	// Open the delete modal
	$scope.delete = function(idx, id, name, firstname) {
		$scope.modalData.idx = idx;
		$scope.modalData.id = id;
		$scope.modalData.name = name;
		$scope.modalData.firstname = firstname;
		$scope.modalDelete.show();
	};
	
	//Deleted a member in the database through the server
	$scope.doDelete = function () {
		$scope.members.splice($scope.modalData.idx,1);
		$http.delete(baseURL + '/members/'+ $scope.modalData.id)
		.success(function(data, status, headers, config){
			getMembers();
			$scope.modalData.id = '';
			$scope.modalData.name = '';
			$scope.modalData.firstname = '';
			$scope.closeDelete();
			$location.path( "/app/admin" );
		})
		.error(function(data, status, headers, config){
		});
	};
	
	/*-------------------------------PENALITY-------------------------------*/
	
	// Create the penality modal that we will use later
	$ionicModal.fromTemplateUrl('html/modifyPenality.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalPenality = modal;
	});

	// Triggered in the penality modal to close it
	$scope.closePenality = function() {
		$scope.modalPenality.hide();
		$scope.modalData.penality = '';
	};
	
	// Open the penality modal
	$scope.penality = function() {
		$scope.modalData.penality = '';
		$scope.modalPenality.show();
	};
	
	// Perform the penality action when the user submits it
	$scope.doPenality = function () {

		var dataObj = {
			amount : $scope.modalData.penality
		};			

		$http.put(baseURL +'/user', dataObj)
		.success(function(data, status, headers, config){
			$scope.amountTag= $scope.modalData.penality
			$scope.modalData.penality = '';
			$scope.closePenality();
		})
		.error(function(data, status, headers, config){
		});
	};

	/*---------------------------------ADD----------------------------------*/
	
	// Create the add modal that we will use later
	$ionicModal.fromTemplateUrl('html/addMember.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.modalAdd = modal;
	});

	// Triggered in the add modal to close it
	$scope.closeAdd = function() {
		$scope.modalAdd.hide();
		$scope.modalData.name = '';
		$scope.modalData.firstname = '';
	};

	// Open the add modal
	$scope.add = function() {
		$scope.modalData.name = '';
		$scope.modalData.firstname = '';
		$scope.modalAdd.show();
	};

	// Perform the add action when the user submits the modify form
	$scope.doAdd = function() {
		var dataObj = {
				name : $scope.modalData.name,
				firstname : $scope.modalData.firstname
		};			
 		$http.post(baseURL + '/members', dataObj)
		.success(function(data, status, headers, config){
			getMembers();
			$scope.modalData.name = '';
			$scope.modalData.firstname = '';
			$scope.closeAdd();
		})
		.error(function(data, status, headers, config){
		});
	};
})

.controller('LoginCtrl', function($scope, $state, $ionicLoading) {
	$ionicLoading.hide();
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str){
			return this.indexOf(str) == 0;
		};
	}
	 
	var urlGoogle = 'https://accounts.google.com/o/oauth2/auth?client_id=353691959302-o4dgc694ejueippvun2ippete4a6sd3h.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Fiswear-box.herokuapp.com%2Foauth2callback%3Fclient_name%3DGoogle2Client&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&response_type=code'
	
	$scope.login = function() {
		$ionicLoading.show({ template: "Connexion..." });

		var ref = window.open(urlGoogle, '_blank', 'location=no');
		ref.addEventListener('loadstart', refLoadStart);
		
		var URL = "https://iswear-box.herokuapp.com/";
		var callbackURL = URL+"user";
		var errorURL = URL+"error";
		
		function refLoadStart(event) {
			if((event.url).startsWith(callbackURL)) {
			    window.location="index.html";
				ref.close();
			}
			if((event.url).startsWith(errorURL)) {
			    window.location="error.html";
			    $ionicLoading.hide();
				ref.close();
			}
		}
	}
	
})

.controller('LogoutCtrl', function($scope, $http, $location, $state, $ionicLoading) {
	var baseURL = "https://iswearbox.herokuapp.com"
	
	$scope.logout = function() {
		$ionicLoading.show({ template: "Déconnexion..." });
		$http.get(baseURL +'/logout')
		.success(function(data, status, headers, config){
			window.location="login.html";
		})
		.error(function(data, status, headers, config){
			$ionicLoading.show({
				template: 'Error: ' + data,
				noBackdrop: true,
				duration: "1000"
			});
		});
	}
	
});
