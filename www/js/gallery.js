function initializeGallery(){

galleryAPI.getAlbums(function(items)
{
    var html = "";

    for(var i = 0; i < items.length; i++)
    {
        var album = items[i];

        html += '<a href="javascript:loadAlbum(\'' + album.title + '\')" class="album"><span>' + escape(album.title) + '</span></a>';
    }

  $(".galleryImages").html( html );

}, function(error){alert(error);});
window.loadAlbum = function(albumName)
{
    galleryAPI.getMedia(albumName, function(items)
    {
        var html = "";

        for(var i = 0; i < 20; i++)
        {
            var media = items[i];

            html += '<div class="galleryComponent"><img src="'+media.thumbnail+'"><div class="imgDescription">'+media.title+'</div></div>';
        }

        $(".galleryImages").html( html );
        $("img").on("click",function(){
          showImage($(this),media);
        })

    }, function(error){alert(error);});
};
}

function showImage(currentImg,media){
var html="";
html += '<img src="'+media.thumbnail+'"></div>';

$(".galleryImages").html( "" );
$(".galleryImages").html( html );
$(".gallerImages").scrollLeft(currentImg.position().left);
localStorage.setItem("lastPage",".galleryWrapper");
localStorage.setItem("currentPage",".imgWrapper");

}
