const colorForm = document.getElementById('color-form')
const colorImgContainerArr = document.querySelectorAll('.color-img-container')
const colorLabelArr = document.querySelectorAll('.color-label')
const inputColor = document.querySelector("input[type='color']")
const switchGrid = document.getElementById('switch-grid')

handleWindowSizeChange()
randomFetchAndRender()

colorForm.addEventListener('submit', function(event){
    event.preventDefault()

    const colorFormData = new FormData(colorForm)
    const colorHex = colorFormData.get('input-color').slice(1) //#000000
    const colorMode = colorFormData.get('drop-down') //monochrome

    fetchAndRenderColor(colorHex, colorMode)
    
})

window.addEventListener('resize', function(event){
    handleWindowSizeChange()
})

function handleWindowSizeChange(){
    if (window.innerWidth >= 320){
        switchGrid.innerHTML = `
            <i class="fa-solid fa-lightbulb"></i>
            <label class="switch" id='switch'>
                <input type="checkbox" checked>
                <span class="slider round"></span>
            </label>
            <i class="fa-regular fa-lightbulb"></i>
        `
    } else {
        switchGrid.innerHTML = `
            <label class="switch" id='switch'>
                <input type="checkbox" checked>
                <span class="slider round"></span>
            </label>
        `
    }
}

function randomFetchAndRender(){
    // Generate a random hex number
    let randColorHex = (Math.floor(Math.random() * 16**6)).toString(16)
    while (randColorHex.length<6){
        randColorHex = '0' + randColorHex
    }
    inputColor.value = '#' + randColorHex // Assign to the color input

    

    //Generate a random color Mode
    const colorMode = ['monochrome', 'monochrome-dark', 'monochrome-light', 'analogic', 
                        'complement', 'analogic-complement', 'triad', 'quad']
    
    const randColorModeIndex = Math.floor(Math.random() * colorMode.length)
    const randColorMode = colorMode[randColorModeIndex]

    document.querySelector(`option[value='${randColorMode}']`).setAttribute('selected', '')

    console.log(randColorHex, randColorMode)
    fetchAndRenderColor(randColorHex, randColorMode)
    
}

function fetchAndRenderColor(colorHex, colorMode){
    const api = `https://www.thecolorapi.com/scheme?hex=${colorHex}&mode=${colorMode}&count=5`

    fetch(api)
        .then(res => res.json())
        .then(data => {renderColor(data)})
}

function renderColor(data) {
    for (let i=0; i<data.colors.length; i++){
        colorImgContainerArr[i].src = data.colors[i].image.bare
        colorLabelArr[i].textContent = data.colors[i].hex.value
    }
}