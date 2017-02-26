angular.module('invoicing', [])

// The default logo for the invoice
.constant('DEFAULT_LOGO', 'images/lotus_hc.png')

// The invoice displayed when the user first uses the app
.constant('DEFAULT_INVOICE', {
  tax: 0.00,
  invoice_number: 10,
  customer_info: {
    name: 'Mr. John Doe',
    web_link: 'Dharma Shop',
    address1: 'ABC, Hungary',
    postal: 'Postal ',
    city: "City Name",
    state: "State Name",
    zip_code: "Zip Code",
    phone_no: "Phone No."
  },
  company_info: {
    name: 'Lotus Handicraft',
    website: 'http://buddhistmala.com.np/',
    address1: 'Boudha-6(inside), Kathmandu, Nepal',
    pan_no: 'PAN No: 301551298',
    phone_no: '+9779841277515'  
  },
  items:[
    { qty: 10, description: 'Gadget', cost: 10, weight: 0 }
  ],
  invoice_headings: {
    image: "Image",
    sn: "SN",
    prodID: "ID",
    description: "Description",
    weight: "Wgt",
    quantity: "Qty",
    rate: "Rate",
    total: "Total"
  }
})

// Service for accessing local storage
.service('LocalStorage', [function() {

  var Service = {};

  // Returns true if there is a logo stored
  var hasLogo = function() {
    return !!localStorage['logo'];
  };

  // Returns a stored logo (false if none is stored)
  Service.getLogo = function() {
    if (hasLogo()) {
      return localStorage['logo'];
    } else {
      return false;
    }
  };

  Service.setLogo = function(logo) {
    localStorage['logo'] = logo;
  };

  // Checks to see if an invoice is stored
  var hasInvoice = function() {
    return !(localStorage['invoice'] == '' || localStorage['invoice'] == null);
  };

  // Returns a stored invoice (false if none is stored)
  Service.getInvoice = function() {
    if (hasInvoice()) {
      return JSON.parse(localStorage['invoice']);
    } else {
      return false;
    }
  };

  Service.setInvoice = function(invoice) {
    localStorage['invoice'] = JSON.stringify(invoice);
  };

  // Clears a stored logo
  Service.clearLogo = function() {
    localStorage['logo'] = '';
  };

  // Clears a stored invoice
  Service.clearinvoice = function() {
    localStorage['invoice'] = '';
  };

  // Clears all local storage
  Service.clear = function() {
    localStorage['invoice'] = '';
    Service.clearLogo();
  };

  return Service;

}])

.service('Currency', [function(){

  var service = {};

  service.all = function() {
    return [
      {
        name: 'British Pound (£)',
        symbol: '£'
      },
      {
        name: 'Canadian Dollar ($)',
        symbol: 'CAD $ '
      },
      {
        name: 'Euro (€)',
        symbol: '€'
      },
      {
        name: 'Indian Rupee (₹)',
        symbol: '₹'
      },
      {
        name: 'Norwegian krone (kr)',
        symbol: 'kr '
      },
      {
        name: 'US Dollar ($)',
        symbol: '$'
      }
    ]
  }

  return service;
  
}])

// Main application controller
.controller('InvoiceCtrl', ['$scope', '$http', 'DEFAULT_INVOICE', 'DEFAULT_LOGO', 'LocalStorage', 'Currency',
  function($scope, $http, DEFAULT_INVOICE, DEFAULT_LOGO, LocalStorage, Currency) {

  // Set defaults
  $scope.currencySymbol = '$';
  $scope.logoRemoved = false;
  $scope.printMode   = false;

  (function init() {
    // Attempt to load invoice from local storage
    !function() {
      var invoice = LocalStorage.getInvoice();
      $scope.invoice = invoice ? invoice : DEFAULT_INVOICE;
    }();

    // Set logo to the one from local storage or use default
    !function() {
      var logo = LocalStorage.getLogo();
      $scope.logo = logo ? logo : DEFAULT_LOGO;
    }();

    $scope.availableCurrencies = Currency.all();

  })()
  // Adds an item to the invoice's items
  $scope.addItem = function() {
    $scope.invoice.items.push({ qty:0, cost:0, description:"" });
  }

  // Toggle's the logo
  $scope.toggleLogo = function(element) {
    $scope.logoRemoved = !$scope.logoRemoved;
    LocalStorage.clearLogo();
  };

  // Triggers the logo chooser click event
  $scope.editLogo = function() {
    // angular.element('#imgInp').trigger('click');
    document.getElementById('imgInp').click();
  };

  $scope.printInfo = function() {
    window.print();
  };

  // Remotes an item from the invoice
  $scope.removeItem = function(item) {
    $scope.invoice.items.splice($scope.invoice.items.indexOf(item), 1);
  };

  // Calculates the sub total of the invoice
  $scope.invoiceSubTotal = function() {
    var total = 0.00;
    angular.forEach($scope.invoice.items, function(item, key){
      total += (item.qty * item.cost);
    });
    return total;
  };

  // Calculates the tax of the invoice
  $scope.calculateTax = function() {
    return (($scope.invoice.tax * $scope.invoiceSubTotal())/100);
  };

  // Calculates the grand total of the invoice
  $scope.calculateGrandTotal = function() {
    saveInvoice();
    return $scope.calculateTax() + $scope.invoiceSubTotal();
  };

  // Clears the local storage
  $scope.clearLocalStorage = function() {
    var confirmClear = confirm('Are you sure you would like to clear the invoice?');
    if(confirmClear) {
      LocalStorage.clear();
      setInvoice(DEFAULT_INVOICE);
    }
  };

  // Sets the current invoice to the given one
  var setInvoice = function(invoice) {
    $scope.invoice = invoice;
    saveInvoice();
  };

  // Reads a url
  var readUrl = function(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById('company_logo').setAttribute('src', e.target.result);
        LocalStorage.setLogo(e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  };

  // Saves the invoice in local storage
  var saveInvoice = function() {
    LocalStorage.setInvoice($scope.invoice);
  };

  // Runs on document.ready
  angular.element(document).ready(function () {
    // Set focus
    document.getElementById('invoice-number').focus();

    // Changes the logo whenever the input changes
    document.getElementById('imgInp').onchange = function() {
      readUrl(this);
    };
  });

 //Image upload feature
 //We are using delegate method so that we can add event listener to the future element created      
 jQuery("#form").delegate("input[type=file]", "change", function(evt){
      if ( this.files && this.files[0] ) {
        var FR= new FileReader();
        FR.onload = function(e) {
             var imgSrc = jQuery('#prodImgSrc_'+evt.target.id);     
             imgSrc[0].src = e.target.result;
             console.log("prod img: ", e.target.result);
        };       
        //console.log("file: ",this.files[0]);
        FR.readAsDataURL( this.files[0] );
    }
 });
 
  //Set default logo by converting it to byte data image so that webpage snapshot can show this logo image in the snapshot
  setTimeout(function() {

           
  },0);

$scope.companyLogoData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVEAAAA9CAMAAAAj6arlAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAMAUExURfLy8q01Nb29vUyTo8JnZsd3d/ny8enMy4aGhlVVVdqkpEiHldfX1+/a2dysq7GxsZSUlMHBwbW1tXNzc2RkZFpaWp8AAF5eXvDc3NGMjFCqveXCwVJSUr9paExMTMnJybGVldOTk/b29pycnFrX8/r5+bm5ue3t7V4GBbE5OMXFxc2Eg4yMjODg4Nzc3OTk5Mu1tpCQkIiIiOCzs/bp6dy9u9yzs4SEhEFBQaGhoZaWlvv19ZKSkoqKipmZmY6Oju7V1aMTFNSbmn19ffz6+qmpqdnZ2assK6QbG+np6b1cW8epqZVvckRERK+vr82Mi7tTUtLS0vLg4KEMDJkAAKSkpLNBQfju7c6fnXh4eLSlqOfExPPv8Z8WFtTJy+W+v6olJfz8/Pz4+D48PPTn5+bm5s7OzmlpaZ0KCqenp4woJvLm5KAAAHp6eqKiov78/KxBQvbs7OG5uZ4FBZwAAOnR0P7+/ticnebb3OG/v/v29m1tbeK4t7VISNetrKYjI6ysrOzS0c6Ih923t9SYl8rKyseCgvbw8LNcX/Tj4rZTUuvPzteioOjJyagdHZ4CAtynp/Dt7vX09O3U1JoFBa8+Pn9/f7hNTcBeXpsDArlQT5wHB+W6ur5gYP/+/Vzh/5YAALdERKMXF60xMIKCgroHq3W4Ojc3N06drzxOUvru+fHN7lfK5EFlbb8YsVKzye296fbe9Ois48g5vOOc3cMotkZ9it+L2EZ7h8xJwdZqzdFax9p70ljM5z5ZX4ODg0NwejhBRFXB2VW/106fsVO2zN2vr6ACAaAICP35+dWppvv7+/jv8Off4OXHxuvg3+nHx/37+7hfXuLU1O7Y18Rubuji4dinp8p/ftqpqezr6/Pz8+Cwr+O3t9mfoNCRkfrz89COjtjW2tO4stC4ueXl5ZwBAZ4BAYAGA/77+8uHh7dYWbpWVrlaWPHj49zQ1vPk49zN0PXl46BVVfDw8OzW1pcPEacvL6UgIPf39+G8u+S7vP79/aIQEP3+/v///5F/+pUAAAEAdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wBT9wclAAAaNElEQVR42uxaC3xU1ZkPA4GbBMjNaxIgTaQELHAhnYEaZsgDCJBgO5RHgk3RgkRelaCUkVbxQQHpVkBYKChSHU3ObGQGhkwmk2QmgeGlwkptsbD11TbsbsnatV1/u9iKJT39vnPOfcwkEQ3tr7u/5crP3Ln3O+d83/9873PjaM/X1EszxN2wNwfSW9dnv+J6eZ5YcXYJ/u2Ycda54xZMN4/off3M5rq9lF4bcMBsLh/CH85cdguvPiOauN5sNpe9R78HgJqdly7gsyEDvnD+FmB9RfQbTkDS3LVlXRki+vT9oKC765zOR28B1gdEF1zaTekOhqh56X8n4o3zn+nU+LOdZvO8B3qYIr8eLulvwVz0zNnwI/v/IKLvDzAvfOv62xUMUef4deX4Z96F76AbMC/c3pPch1yul2+AaC5ik/+5EY2aOfuw6/DNIJqtbo+t3mHq+zS5mfX1Nbm9i9QN0Z0Lzc571m2fzhHtN/kS09UFQxHRNRXf6SuiR1yuQ39vRA/zyXKPHHvl8/OiSzLc5Rpe37tIsYhuuOQ0d/36Ah3AEF1TnvVLNPvpD72xEH9XbL7Qi9wZkcq/EaIJJFlHdEpEvmlEawCS/n2eJhNGu1yfA9Efljk7v0IH0otLO1ls2j7oLPw5uHNI+Rr8XTb5+t73Fr86Pj4rFlGy+oaISiXv9gXRiAFRByE3hWgmqcS/rqPZg/voJU+6GKLJE5hI+0nviJ7jfxYv7Fx6fsFLu+kkVMo1/S5OHvDSopee2XvxaQS0s3zdtHvOLjy7/kBiN0Tn3hDRKvk3fUHUYtRRZdRNIZqgpNDM04BoDvliH42eI2qRuUjknV4R/f6AQfhn0oHOrXT8la7L9NdmZ1miloB+v4vp6Mfr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';
      
 //Take snapshot of a wabpage and save it in a image file
 $scope.saveInvoice = function() {
    html2canvas(jQuery("#mainInvoceContent"), {
        background :'#FFFFFF',
        width: '1000',
        onrendered: function(canvas) {
            //document.getElementById('previewSnapshot').innerHTML = "";
            //var previewSpace = jQuery("#previewSnapshot");
            //previewSpace.html("");
            //previewSpace.append(canvas);
            
            //create image and download it
            var a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg',1).replace('image/jpeg', 'octet-stream');
            a.download = 'invoice.jpeg';
            a.click();
        }
    });
//    console.log("sending email...");
//    jQuery.ajax({
//      type: 'POS',
//      url: 'https://mandrillapp.com/api/1.0/messages/send.json',
//      data: {
//        'key': 'Vx9TSwHmpDvo3gbA-DmDpg',
//        'message': {
//          'from_email': 'lieferoo@gmail.com',
//          'to': [
//              {
//                'email': 'jiten.ktm@gmail.com',
//                'name': 'JITEN',
//                'type': 'to'
//              },
//              {
//                'email': 'jitubutwal144@gmail.com',
//                'name': 'ANOTHER RECIPIENT NAME (OPTIONAL)',
//                'type': 'to'
//              }
//            ],
//          'autotext': 'true',
//          'subject': 'Mandril test email api',
//          'html': 'YOUR EMAIL CONTENT HERE! YOU CAN USE HTML!'
//        }
//      }
//     }).done(function(response) {
//       console.log(response); // if you're into that sorta thing
//     });
}      
      
// var prodImgElem = document.getElementById('prodImage');
// angular.element('#prodImage').addEventListener('change', function(e) {
//     console.log("changing image", e.target);
//     if ( this.files && this.files[0] ) {
//        var FR= new FileReader();
//        FR.onload = function(e) {
//            
//             angular.element('#prodImgSrc')[0].src = e.target.result;
//            
//            console.log(angular.element('#prodImgSrc'),e.target.result); 
//        };       
//        FR.readAsDataURL( this.files[0] );
//    }
// },false);
      
  //Datepicker code      
  var $date = $('.docs-date');
  var $container = $('.docs-datepicker-container');
  var $trigger = $('.docs-datepicker-trigger');
  var options = {
    show: function (e) {
      console.log(e.type, e.namespace);
    },
    hide: function (e) {
      console.log(e.type, e.namespace);
    },
    pick: function (e) {
      console.log(e.type, e.namespace, e.view);
    }
  };

  $date.on({
    'show.datepicker': function (e) {
      console.log(e.type, e.namespace);
    },
    'hide.datepicker': function (e) {
      console.log(e.type, e.namespace);
    },
    'pick.datepicker': function (e) {
      console.log(e.type, e.namespace, e.view);
    }
  }).datepicker(options);

  $('.docs-options, .docs-toggles').on('change', function (e) {
    var target = e.target;
    var $target = $(target);
    var name = $target.attr('name');
    var value = target.type === 'checkbox' ? target.checked : $target.val();
    var $optionContainer;

    switch (name) {
      case 'container':
        if (value) {
          value = $container;
          $container.show();
        } else {
          $container.hide();
        }

        break;

      case 'trigger':
        if (value) {
          value = $trigger;
          $trigger.prop('disabled', false);
        } else {
          $trigger.prop('disabled', true);
        }

        break;

      case 'inline':
        $optionContainer = $('input[name="container"]');

        if (!$optionContainer.prop('checked')) {
          $optionContainer.click();
        }

        break;

      case 'language':
        $('input[name="format"]').val($.fn.datepicker.languages[value].format);
        break;
    }

    options[name] = value;
    $date.datepicker('reset').datepicker('destroy').datepicker(options);
  });

  $('.docs-actions').on('click', 'button', function (e) {
    var data = $(this).data();
    var args = data.arguments || [];
    var result;

    e.stopPropagation();

    if (data.method) {
      if (data.source) {
        $date.datepicker(data.method, $(data.source).val());
      } else {
        result = $date.datepicker(data.method, args[0], args[1], args[2]);

        if (result && data.target) {
          $(data.target).val(result);
        }
      }
    }
  });

  $('[data-toggle="datepicker"]').datepicker();
}])
