# Helper function to fetch and save data from a URL
function FetchAndSaveData {
    param (
        [string]$url,
        [string]$outputFile
    )
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $content = $response.Content | ConvertFrom-Json
            # Remove the "data" wrapper, if exists, and just extract the array
            if ($content.PSObject.Properties['data']) {
                $content = $content.data
            }
            $content | ConvertTo-Json -Depth 5 | Set-Content -Path $outputFile
            Write-Host "Data saved to $outputFile"
        } else {
            Write-Host "Error: Received status code $($response.StatusCode) for URL: $url"
        }
    } catch {
        Write-Host "Error fetching data from $url"
        Write-Host "Exception: $_"
    }
}

# Fetch Provinces and save to provinces.json
$provincesUrl = "https://wilayah.id/api/provinces.json"
FetchAndSaveData -url $provincesUrl -outputFile "provinces.json"

# Load Provinces from the file
$provinces = Get-Content "provinces.json" | ConvertFrom-Json

# Verify that provinces data is correctly loaded
Write-Host "Loaded Provinces: $($provinces.Count)"

# Fetch Cities (Regencies) for each Province and save to cities.json
$cities = @()

foreach ($province in $provinces) {
    $provinceCode = $province.code
    $citiesUrl = "https://wilayah.id/api/regencies/$provinceCode.json"

    Write-Host "Fetching cities for province: $($province.name) using URL: $citiesUrl"
    try {
        $response = Invoke-WebRequest -Uri $citiesUrl -Method Get -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $cityData = $response.Content | ConvertFrom-Json
            if ($cityData.PSObject.Properties['data']) {
                $cities += $cityData.data
            }
        } else {
            Write-Host "Error: Received status code $($response.StatusCode) for province code: $provinceCode"
        }
    } catch {
        Write-Host "Error fetching cities for province code: $provinceCode"
        Write-Host "Exception: $_"
    }
}

# Save cities data to cities.json
$cities | ConvertTo-Json -Depth 5 | Set-Content -Path "cities.json"
Write-Host "Cities data saved to cities.json"

# Fetch Districts (Sub-districts) for each City and save to districts.json
$districts = @()

foreach ($city in $cities) {
    $cityCode = $city.code
    $districtsUrl = "https://wilayah.id/api/districts/$cityCode.json"

    Write-Host "Fetching districts for city: $($city.name) using URL: $districtsUrl"
    try {
        $response = Invoke-WebRequest -Uri $districtsUrl -Method Get -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $districtData = $response.Content | ConvertFrom-Json
            if ($districtData.PSObject.Properties['data']) {
                $districts += $districtData.data
            }
        } else {
            Write-Host "Error: Received status code $($response.StatusCode) for city code: $cityCode"
        }
    } catch {
        Write-Host "Error fetching districts for city code: $cityCode"
        Write-Host "Exception: $_"
    }
}

# Save districts data to districts.json
$districts | ConvertTo-Json -Depth 5 | Set-Content -Path "districts.json"
Write-Host "Districts data saved to districts.json"

# Fetch Villages for each District and save to villages.json
$villages = @()

foreach ($district in $districts) {
    $districtCode = $district.code
    $villagesUrl = "https://wilayah.id/api/villages/$districtCode.json"

    Write-Host "Fetching villages for district: $($district.name) using URL: $villagesUrl"
    try {
        $response = Invoke-WebRequest -Uri $villagesUrl -Method Get -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $villageData = $response.Content | ConvertFrom-Json
            if ($villageData.PSObject.Properties['data']) {
                $villages += $villageData.data
            }
        } else {
            Write-Host "Error: Received status code $($response.StatusCode) for district code: $districtCode"
        }
    } catch {
        Write-Host "Error fetching villages for district code: $districtCode"
        Write-Host "Exception: $_"
    }
}

# Save villages data to villages.json
$villages | ConvertTo-Json -Depth 5 | Set-Content -Path "villages.json"
Write-Host "Villages data saved to villages.json"
